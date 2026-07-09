import Foundation
import Photos
import UIKit

protocol PhotoLibrarySaveServiceProtocol {
    func saveImage(from url: URL) async throws
}

final class PhotoLibrarySaveService: PhotoLibrarySaveServiceProtocol {
    private let session: URLSession

    init(session: URLSession = .shared) {
        self.session = session
    }

    func saveImage(from url: URL) async throws {
        let (data, response) = try await session.data(from: url)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode),
              let image = UIImage(data: data) else {
            throw APIError.imageDownloadFailed
        }

        let status = await PHPhotoLibrary.requestAuthorization(for: .addOnly)

        guard status == .authorized || status == .limited else {
            throw APIError.photoLibraryPermissionDenied
        }

        try await save(image)
    }

    private func save(_ image: UIImage) async throws {
        try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
            PHPhotoLibrary.shared().performChanges {
                PHAssetChangeRequest.creationRequestForAsset(from: image)
            } completionHandler: { isSuccess, error in
                if let error {
                    continuation.resume(throwing: error)
                    return
                }

                if isSuccess {
                    continuation.resume()
                    return
                }

                continuation.resume(throwing: APIError.imageDownloadFailed)
            }
        }
    }
}
