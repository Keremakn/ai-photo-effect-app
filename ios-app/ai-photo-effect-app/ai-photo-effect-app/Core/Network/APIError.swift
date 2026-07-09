import Foundation

enum APIError: LocalizedError {
    case invalidResponse
    case serverMessage(String)
    case imageEncodingFailed
    case imageDownloadFailed
    case photoLibraryPermissionDenied

    var errorDescription: String? {
        switch self {
        case .invalidResponse:
            return "Invalid server response."
        case .serverMessage(let message):
            return message
        case .imageEncodingFailed:
            return "Selected image could not be prepared."
        case .imageDownloadFailed:
            return "Generated image could not be downloaded."
        case .photoLibraryPermissionDenied:
            return "Photo library permission is required to save the image."
        }
    }
}
