import Foundation

enum APIError: LocalizedError {
    case invalidResponse
    case serverMessage(String)
    case imageEncodingFailed

    var errorDescription: String? {
        switch self {
        case .invalidResponse:
            return "Invalid server response."
        case .serverMessage(let message):
            return message
        case .imageEncodingFailed:
            return "Selected image could not be prepared."
        }
    }
}
