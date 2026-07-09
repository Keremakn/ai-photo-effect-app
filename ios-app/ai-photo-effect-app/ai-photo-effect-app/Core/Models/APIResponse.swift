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

struct GenerationHistoryItem: Identifiable, Decodable, Equatable {
    let id: String
    let effectId: String
    let effectName: String
    let inputImageUrl: String
    let resultImageUrl: String
    let provider: String
    let isFavorite: Bool?
    let createdAt: String?
}

struct PaginatedResponse<Item: Decodable>: Decodable {
    let items: [Item]
    let pagination: Pagination
}

struct Pagination: Decodable {
    let page: Int
    let limit: Int
    let total: Int
    let totalPages: Int
}
