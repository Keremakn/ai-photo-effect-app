import Foundation

struct Effect: Identifiable, Decodable, Equatable {
    let id: String
    let name: String
    let description: String
    let category: String?
    let tags: [String]?
    let isActive: Bool
    let isFavorite: Bool?
}
