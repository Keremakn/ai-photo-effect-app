import Foundation
import UIKit
import Combine

@MainActor
final class HomeViewModel: ObservableObject {
    @Published var effects: [Effect] = []
    @Published var selectedEffect: Effect?
    @Published var selectedImage: UIImage?
    @Published var resultImageUrl: URL?
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let effectService: EffectAPIServiceProtocol
    private let generationService: GenerationAPIServiceProtocol

    init(
        effectService: EffectAPIServiceProtocol? = nil,
        generationService: GenerationAPIServiceProtocol? = nil
    ) {
        self.effectService = effectService ?? EffectAPIService()
        self.generationService = generationService ?? GenerationAPIService()
    }

    var canGenerate: Bool {
        selectedImage != nil && selectedEffect != nil && !isLoading
    }

    func loadEffects() async {
        isLoading = true
        errorMessage = nil

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
        resultImageUrl = nil

        do {
            let result = try await generationService.generate(
                image: selectedImage,
                effectId: selectedEffect.id
            )
            resultImageUrl = URL(string: result.resultImageUrl)
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }
}
