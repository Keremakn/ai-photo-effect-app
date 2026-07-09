import SwiftUI

struct HomeView: View {
    @StateObject private var viewModel = HomeViewModel()
    @State private var isImagePickerPresented = false
    @State private var activeSection: HomeSection = .generate

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isAuthenticated {
                    authenticatedContent
                } else {
                    AuthView(viewModel: viewModel)
                }
            }
            .navigationTitle("AI Photo Effects")
            .toolbar {
                if viewModel.isAuthenticated {
                    ToolbarItem(placement: .topBarTrailing) {
                        Menu {
                            Text(viewModel.userEmail)
                            Button("Logout", role: .destructive) {
                                viewModel.logout()
                            }
                        } label: {
                            Image(systemName: "person.crop.circle")
                        }
                    }
                }
            }
            .alert("Something went wrong", isPresented: errorBinding) {
                Button("OK", role: .cancel) {
                    viewModel.errorMessage = nil
                }
            } message: {
                Text(viewModel.errorMessage ?? "")
            }
            .sheet(isPresented: $isImagePickerPresented) {
                PhotoPickerView(image: $viewModel.selectedImage)
            }
            .task {
                if viewModel.isAuthenticated && viewModel.effects.isEmpty {
                    await viewModel.loadEffects()
                }
                if viewModel.isAuthenticated && viewModel.generationHistory.isEmpty {
                    await viewModel.loadHistory()
                }
            }
        }
    }

    private var authenticatedContent: some View {
        ScrollView {
            VStack(spacing: 20) {
                Picker("Section", selection: $activeSection) {
                    Text("Generate").tag(HomeSection.generate)
                    Text("History").tag(HomeSection.history)
                }
                .pickerStyle(.segmented)

                if let successMessage = viewModel.successMessage {
                    Label(successMessage, systemImage: "checkmark.circle.fill")
                        .foregroundStyle(.green)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }

                switch activeSection {
                case .generate:
                    generateContent
                case .history:
                    GenerationHistoryView(
                        generations: viewModel.generationHistory,
                        isLoading: viewModel.isLoadingHistory,
                        onRefresh: {
                            Task {
                                await viewModel.loadHistory()
                            }
                        }
                    )
                }
            }
            .padding()
        }
    }

    private var generateContent: some View {
        VStack(spacing: 20) {
            ImagePickerView(
                image: viewModel.selectedImage,
                onPickImage: {
                    isImagePickerPresented = true
                }
            )

            EffectSelectionView(
                effects: viewModel.effects,
                selectedEffect: viewModel.selectedEffect,
                onSelect: { effect in
                    viewModel.selectedEffect = effect
                }
            )

            Button {
                Task {
                    await viewModel.generate()
                }
            } label: {
                Label("Generate", systemImage: "sparkles")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)
            .disabled(!viewModel.canGenerate)

            if viewModel.isLoading {
                ProcessingView()
            }

            if let resultImageUrl = viewModel.resultImageUrl {
                ResultView(
                    resultImageUrl: resultImageUrl,
                    isSaving: viewModel.isSavingResult,
                    onSave: {
                        Task {
                            await viewModel.saveResultToPhotos()
                        }
                    }
                )
            }
        }
    }

    private var errorBinding: Binding<Bool> {
        Binding(
            get: { viewModel.errorMessage != nil },
            set: { isPresented in
                if !isPresented {
                    viewModel.errorMessage = nil
                }
            }
        )
    }
}

private enum HomeSection {
    case generate
    case history
}

#Preview {
    HomeView()
}
