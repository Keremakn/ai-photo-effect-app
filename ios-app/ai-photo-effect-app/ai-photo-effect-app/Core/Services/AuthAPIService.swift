import Foundation

protocol AuthAPIServiceProtocol {
    func login(email: String, password: String) async throws -> AuthResult
    func register(email: String, password: String) async throws -> AuthUser
}

final class AuthAPIService: AuthAPIServiceProtocol {
    private let baseURL: URL
    private let session: URLSession

    init(baseURL: URL = APIConfiguration.baseURL, session: URLSession = .shared) {
        self.baseURL = baseURL
        self.session = session
    }

    func login(email: String, password: String) async throws -> AuthResult {
        var request = makeJSONRequest(path: "api/auth/login")
        request.httpBody = try JSONEncoder().encode(AuthPayload(email: email, password: password))

        let (data, response) = try await session.data(for: request)
        try validate(response, data: data)

        let apiResponse = try JSONDecoder().decode(APIResponse<AuthResult>.self, from: data)
        guard apiResponse.success, let result = apiResponse.data else {
            throw APIError.serverMessage(apiResponse.message ?? "Login failed.")
        }

        return result
    }

    func register(email: String, password: String) async throws -> AuthUser {
        var request = makeJSONRequest(path: "api/auth/register")
        request.httpBody = try JSONEncoder().encode(AuthPayload(email: email, password: password))

        let (data, response) = try await session.data(for: request)
        try validate(response, data: data)

        let apiResponse = try JSONDecoder().decode(APIResponse<AuthUser>.self, from: data)
        guard apiResponse.success, let user = apiResponse.data else {
            throw APIError.serverMessage(apiResponse.message ?? "Registration failed.")
        }

        return user
    }

    private func makeJSONRequest(path: String) -> URLRequest {
        var request = URLRequest(url: baseURL.appending(path: path))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        return request
    }

    private func validate(_ response: URLResponse, data: Data) throws {
        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            if let apiResponse = try? JSONDecoder().decode(APIResponse<AuthResult>.self, from: data),
               let message = apiResponse.message {
                throw APIError.serverMessage(message)
            }

            throw APIError.invalidResponse
        }
    }
}

private struct AuthPayload: Encodable {
    let email: String
    let password: String
}
