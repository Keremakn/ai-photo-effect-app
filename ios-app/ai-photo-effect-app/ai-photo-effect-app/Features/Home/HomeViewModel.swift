import Foundation
import UIKit
import Combine

@MainActor
final class HomeViewModel: ObservableObject {
    @Published var effects: [Effect] = []
    @Published var selectedEffect: Effect?
    @Published var selectedImage: UIImage?
    @Published var resultImageUrl: URL?
    @Published var generationHistory: [GenerationHistoryItem] = []
    @Published var isLoading = false
    @Published var isLoadingHistory = false
    @Published var isSavingResult = false
    @Published var errorMessage: String?
    @Published var successMessage: String?
    @Published var isAuthenticated: Bool
    @Published var userEmail: String
    @Published var sessionStore: AuthSessionStore

    private let effectService: EffectAPIServiceProtocol
    private let authService: AuthAPIServiceProtocol
    private let generationService: GenerationAPIServiceProtocol
    private let photoLibrarySaveService: PhotoLibrarySaveServiceProtocol

    init(
        effectService: EffectAPIServiceProtocol? = nil,
        authService: AuthAPIServiceProtocol? = nil,
        generationService: GenerationAPIServiceProtocol? = nil,
        photoLibrarySaveService: PhotoLibrarySaveServiceProtocol? = nil,
        sessionStore: AuthSessionStore? = nil
    ) {
        let resolvedSessionStore = sessionStore ?? AuthSessionStore()
        self.sessionStore = resolvedSessionStore
        self.isAuthenticated = resolvedSessionStore.isAuthenticated
        self.userEmail = resolvedSessionStore.user?.email ?? ""
        self.effectService = effectService ?? EffectAPIService()
        self.authService = authService ?? AuthAPIService()
        self.generationService = generationService ?? GenerationAPIService(tokenProvider: {
            resolvedSessionStore.token
        })
        self.photoLibrarySaveService = photoLibrarySaveService ?? PhotoLibrarySaveService()
    }

    var canGenerate: Bool {
        sessionStore.isAuthenticated && selectedImage != nil && selectedEffect != nil && !isLoading
    }

    func login(email: String, password: String) async {
        isLoading = true
        errorMessage = nil
        successMessage = nil

        do {
            let authResult = try await authService.login(email: email, password: password)
            sessionStore.save(authResult: authResult)
            syncSessionState()
            successMessage = "Logged in."
            if effects.isEmpty {
                await loadEffects()
            }
            await loadHistory()
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    func register(email: String, password: String) async {
        isLoading = true
        errorMessage = nil
        successMessage = nil

        do {
            _ = try await authService.register(email: email, password: password)
            let authResult = try await authService.login(email: email, password: password)
            sessionStore.save(authResult: authResult)
            syncSessionState()
            successMessage = "Account created."
            if effects.isEmpty {
                await loadEffects()
            }
            await loadHistory()
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    func logout() {
        sessionStore.logout()
        syncSessionState()
        selectedImage = nil
        resultImageUrl = nil
        generationHistory = []
        successMessage = nil
        errorMessage = nil
    }

    func loadEffects() async {
        isLoading = true
        errorMessage = nil
        successMessage = nil

        do {
            effects = try await effectService.fetchEffects()
            selectedEffect = selectedEffect ?? effects.first
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    func generate() async {
        guard let selectedImage, let selectedEffect else { return }

        isLoading = true
        errorMessage = nil
        successMessage = nil
        resultImageUrl = nil

        do {
            let result = try await generationService.generate(
                image: selectedImage,
                effectId: selectedEffect.id
            )
            resultImageUrl = URL(string: result.resultImageUrl)
            await loadHistory()
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    func saveResultToPhotos() async {
        guard let resultImageUrl else { return }

        isSavingResult = true
        errorMessage = nil
        successMessage = nil

        do {
            try await photoLibrarySaveService.saveImage(from: resultImageUrl)
            successMessage = "Saved to Photos."
        } catch {
            errorMessage = error.localizedDescription
        }

        isSavingResult = false
    }

    func loadHistory() async {
        guard sessionStore.isAuthenticated else { return }

        isLoadingHistory = true
        errorMessage = nil

        do {
            generationHistory = try await generationService.fetchMyGenerations()
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoadingHistory = false
    }

    private func syncSessionState() {
        isAuthenticated = sessionStore.isAuthenticated
        userEmail = sessionStore.user?.email ?? ""
    }
}
