import SwiftUI

struct ResultView: View {
    let resultImageUrl: URL

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
        }
    }
}
