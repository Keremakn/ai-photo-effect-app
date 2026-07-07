import Foundation

protocol EffectAPIServiceProtocol {
    func fetchEffects() async throws -> [Effect]
}

final class EffectAPIService: EffectAPIServiceProtocol {
    private let baseURL: URL
    private let session: URLSession

    init(baseURL: URL = APIConfiguration.baseURL, session: URLSession = .shared) {
        self.baseURL = baseURL
        self.session = session
    }

    func fetchEffects() async throws -> [Effect] {
        let url = baseURL.appending(path: "api/effects")
        let (data, response) = try await session.data(from: url)
        try validate(response)

        let apiResponse = try JSONDecoder().decode(APIResponse<[Effect]>.self, from: data)
        guard apiResponse.success, let effects = apiResponse.data else {
            throw APIError.serverMessage(apiResponse.message ?? "Effects could not be loaded.")
        }

        return effects
    }

    private func validate(_ response: URLResponse) throws {
        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw APIError.invalidResponse
        }
    }
}
