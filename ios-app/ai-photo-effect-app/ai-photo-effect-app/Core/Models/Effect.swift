import Foundation

struct Effect: Identifiable, Decodable, Equatable {
    let id: String
    let name: String
    let description: String
    let isActive: Bool
}
