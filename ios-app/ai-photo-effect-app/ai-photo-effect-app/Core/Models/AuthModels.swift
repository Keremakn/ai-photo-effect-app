import Foundation

struct AuthUser: Codable, Equatable {
    let id: String
    let email: String
    let role: String
    let createdAt: String?
}

struct AuthResult: Decodable {
    let token: String
    let user: AuthUser
}
