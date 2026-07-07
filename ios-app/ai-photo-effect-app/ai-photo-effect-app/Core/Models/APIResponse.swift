import Foundation

struct APIResponse<Data: Decodable>: Decodable {
    let success: Bool
    let data: Data?
    let message: String?
}

struct GenerateResult: Decodable {
    let resultImageUrl: String
    let generationId: String?
}
