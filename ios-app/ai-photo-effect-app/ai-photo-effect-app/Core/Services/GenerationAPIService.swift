import Foundation
import UIKit

protocol GenerationAPIServiceProtocol {
    func generate(image: UIImage, effectId: String) async throws -> GenerateResult
}

final class GenerationAPIService: GenerationAPIServiceProtocol {
    private let baseURL: URL
    private let session: URLSession

    init(baseURL: URL = APIConfiguration.baseURL, session: URLSession = .shared) {
        self.baseURL = baseURL
        self.session = session
    }

    func generate(image: UIImage, effectId: String) async throws -> GenerateResult {
        guard let imageData = image.jpegData(compressionQuality: 0.88) else {
            throw APIError.imageEncodingFailed
        }

        let boundary = "Boundary-\(UUID().uuidString)"
        var request = URLRequest(url: baseURL.appending(path: "api/generate"))
        request.httpMethod = "POST"
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        request.httpBody = makeMultipartBody(
            boundary: boundary,
            imageData: imageData,
            effectId: effectId
        )

        let (data, response) = try await session.data(for: request)
        try validate(response, data: data)

        let apiResponse = try JSONDecoder().decode(APIResponse<GenerateResult>.self, from: data)
        guard apiResponse.success, let result = apiResponse.data else {
            throw APIError.serverMessage(apiResponse.message ?? "Image generation failed.")
        }

        return result
    }

    private func makeMultipartBody(boundary: String, imageData: Data, effectId: String) -> Data {
        var body = Data()
        let lineBreak = "\r\n"

        body.append("--\(boundary)\(lineBreak)")
        body.append("Content-Disposition: form-data; name=\"effectId\"\(lineBreak)\(lineBreak)")
        body.append("\(effectId)\(lineBreak)")

        body.append("--\(boundary)\(lineBreak)")
        body.append("Content-Disposition: form-data; name=\"image\"; filename=\"photo.jpg\"\(lineBreak)")
        body.append("Content-Type: image/jpeg\(lineBreak)\(lineBreak)")
        body.append(imageData)
        body.append(lineBreak)

        body.append("--\(boundary)--\(lineBreak)")
        return body
    }

    private func validate(_ response: URLResponse, data: Data) throws {
        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            if let apiResponse = try? JSONDecoder().decode(APIResponse<GenerateResult>.self, from: data),
               let message = apiResponse.message {
                throw APIError.serverMessage(message)
            }

            throw APIError.invalidResponse
        }
    }
}

private extension Data {
    mutating func append(_ string: String) {
        if let data = string.data(using: .utf8) {
            append(data)
        }
    }
}
