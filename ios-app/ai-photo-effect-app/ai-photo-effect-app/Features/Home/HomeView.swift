import SwiftUI

struct HomeView: View {
    @StateObject private var viewModel = HomeViewModel()
    @State private var isImagePickerPresented = false

    var body: some View {
        NavigationStack {
            ScrollView {
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
                        ResultView(resultImageUrl: resultImageUrl)
                    }
                }
                .padding()
            }
            .navigationTitle("AI Photo Effects")
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
                if viewModel.effects.isEmpty {
                    await viewModel.loadEffects()
                }
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

#Preview {
    HomeView()
}
