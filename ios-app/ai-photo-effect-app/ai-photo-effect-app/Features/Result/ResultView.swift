import SwiftUI
import UIKit

struct ResultView: View {
    let originalImage: UIImage?
    let resultImageUrl: URL
    let isSaving: Bool
    let onSave: () -> Void
    let onFavorite: () -> Void
    @State private var comparison: Double = 0.5

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Result")
                .font(.headline)

            if let originalImage {
                BeforeAfterView(originalImage: originalImage, resultImageUrl: resultImageUrl, comparison: $comparison)
                Slider(value: $comparison, in: 0...1)
            } else {
                ResultImageView(resultImageUrl: resultImageUrl)
            }

            HStack {
                Button(action: onSave) {
                    Label(isSaving ? "Saving" : "Save to Photos", systemImage: "square.and.arrow.down")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
                .controlSize(.large)
                .disabled(isSaving)

                Button(action: onFavorite) {
                    Label("Favorite", systemImage: "heart")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
                .controlSize(.large)
            }
        }
    }
}

private struct ResultImageView: View {
    let resultImageUrl: URL

    var body: some View {
        AsyncImage(url: resultImageUrl) { phase in
            switch phase {
            case .empty:
                ProgressView()
                    .frame(maxWidth: .infinity, minHeight: 260)
            case .success(let image):
                image
                    .resizable()
                    .scaledToFit()
                    .frame(maxWidth: .infinity)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
            case .failure:
                ContentUnavailableView(
                    "Result unavailable",
                    systemImage: "exclamationmark.triangle"
                )
                .frame(minHeight: 220)
            @unknown default:
                EmptyView()
            }
        }
    }
}

private struct BeforeAfterView: View {
    let originalImage: UIImage
    let resultImageUrl: URL
    @Binding var comparison: Double

    var body: some View {
        GeometryReader { proxy in
            ZStack(alignment: .leading) {
                AsyncImage(url: resultImageUrl) { phase in
                    if case .success(let image) = phase {
                        image
                            .resizable()
                            .scaledToFill()
                    } else {
                        ProgressView()
                    }
                }
                .frame(width: proxy.size.width, height: proxy.size.height)
                .clipped()

                Image(uiImage: originalImage)
                    .resizable()
                    .scaledToFill()
                    .frame(width: proxy.size.width, height: proxy.size.height)
                    .clipped()
                    .mask(alignment: .leading) {
                        Rectangle()
                            .frame(width: proxy.size.width * comparison)
                    }

                Rectangle()
                    .fill(.white)
                    .frame(width: 3)
                    .offset(x: proxy.size.width * comparison)
            }
        }
        .frame(height: 320)
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}
