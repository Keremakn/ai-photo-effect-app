import SwiftUI

struct ResultView: View {
    let resultImageUrl: URL
    let isSaving: Bool
    let onSave: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Result")
                .font(.headline)

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

            Button(action: onSave) {
                Label(isSaving ? "Saving" : "Save to Photos", systemImage: "square.and.arrow.down")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.bordered)
            .controlSize(.large)
            .disabled(isSaving)
        }
    }
}
