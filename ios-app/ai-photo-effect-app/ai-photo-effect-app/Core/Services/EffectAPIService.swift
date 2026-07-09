import Foundation

protocol EffectAPIServiceProtocol {
    func fetchEffects() async throws -> [Effect]
    func fetchFavoriteEffects() async throws -> [Effect]
    func setFavorite(effectId: String, isFavorite: Bool) async throws
}

final class EffectAPIService: EffectAPIServiceProtocol {
    private let baseURL: URL
    private let session: URLSession
    private let tokenProvider: () -> String?

    init(
        baseURL: URL = APIConfiguration.baseURL,
        session: URLSession = .shared,
        tokenProvider: @escaping () -> String? = { nil }
    ) {
        self.baseURL = baseURL
        self.session = session
        self.tokenProvider = tokenProvider
    }

    func fetchEffects() async throws -> [Effect] {
        var request = URLRequest(url: baseURL.appending(path: "api/effects"))
        if let token = tokenProvider() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        let (data, response) = try await session.data(for: request)
        try validate(response, data: data)

        let apiResponse = try JSONDecoder().decode(APIResponse<[Effect]>.self, from: data)
        guard apiResponse.success, let effects = apiResponse.data else {
            throw APIError.serverMessage(apiResponse.message ?? "Effects could not be loaded.")
        }

        return effects
    }

    func fetchFavoriteEffects() async throws -> [Effect] {
        var request = URLRequest(url: baseURL.appending(path: "api/effects/favorites"))
        if let token = tokenProvider() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        let (data, response) = try await session.data(for: request)
        try validate(response, data: data)

        let apiResponse = try JSONDecoder().decode(APIResponse<[Effect]>.self, from: data)
        guard apiResponse.success, let effects = apiResponse.data else {
            throw APIError.serverMessage(apiResponse.message ?? "Favorite effects could not be loaded.")
        }

        return effects
    }

    func setFavorite(effectId: String, isFavorite: Bool) async throws {
        var request = URLRequest(url: baseURL.appending(path: "api/effects/\(effectId)/favorite"))
        request.httpMethod = "PUT"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token = tokenProvider() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        request.httpBody = try JSONEncoder().encode(FavoritePayload(isFavorite: isFavorite))

        let (data, response) = try await session.data(for: request)
        try validate(response, data: data)
    }

    private func validate(_ response: URLResponse, data: Data) throws {
        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            if let apiResponse = try? JSONDecoder().decode(APIResponse<Effect>.self, from: data),
               let message = apiResponse.message {
                throw APIError.serverMessage(message)
            }
            throw APIError.invalidResponse
        }
    }
}

private struct FavoritePayload: Encodable {
    let isFavorite: Bool
}
