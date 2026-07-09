import Foundation
import Combine

@MainActor
final class AuthSessionStore: ObservableObject {
    @Published private(set) var user: AuthUser?

    private let defaults: UserDefaults
    private let tokenKey = "authToken"
    private let userKey = "authUser"

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults

        if let data = defaults.data(forKey: userKey),
           let storedUser = try? JSONDecoder().decode(AuthUser.self, from: data) {
            user = storedUser
        }
    }

    var token: String? {
        defaults.string(forKey: tokenKey)
    }

    var isAuthenticated: Bool {
        token != nil && user != nil
    }

    func save(authResult: AuthResult) {
        defaults.set(authResult.token, forKey: tokenKey)

        if let data = try? JSONEncoder().encode(authResult.user) {
            defaults.set(data, forKey: userKey)
        }

        user = authResult.user
    }

    func logout() {
        defaults.removeObject(forKey: tokenKey)
        defaults.removeObject(forKey: userKey)
        user = nil
    }
}
