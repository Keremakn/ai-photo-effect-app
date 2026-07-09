import SwiftUI

struct GenerationHistoryView: View {
    let generations: [GenerationHistoryItem]
    let isLoading: Bool
    let onRefresh: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("History")
                        .font(.headline)
                    Text("\(generations.count) generated photos")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                Button(action: onRefresh) {
                    Image(systemName: "arrow.clockwise")
                }
                .disabled(isLoading)
            }

            if isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, minHeight: 120)
            } else if generations.isEmpty {
                ContentUnavailableView(
                    "No history yet",
                    systemImage: "photo.stack",
                    description: Text("Generated photos will appear here.")
                )
                .frame(minHeight: 220)
            } else {
                LazyVStack(spacing: 12) {
                    ForEach(generations) { generation in
                        GenerationHistoryRow(generation: generation)
                    }
                }
            }
        }
    }
}

private struct GenerationHistoryRow: View {
    let generation: GenerationHistoryItem

    var body: some View {
        HStack(spacing: 12) {
            AsyncImage(url: URL(string: generation.resultImageUrl)) { phase in
                switch phase {
                case .empty:
                    ProgressView()
                case .success(let image):
                    image
                        .resizable()
                        .scaledToFill()
                case .failure:
                    Image(systemName: "photo")
                        .foregroundStyle(.secondary)
                @unknown default:
                    EmptyView()
                }
            }
            .frame(width: 76, height: 76)
            .clipShape(RoundedRectangle(cornerRadius: 8))

            VStack(alignment: .leading, spacing: 4) {
                Text(generation.effectName)
                    .font(.headline)
                Text(generation.provider)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                if let createdAt = generation.createdAt {
                    Text(createdAt)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            Spacer()

            if let url = URL(string: generation.resultImageUrl) {
                Link(destination: url) {
                    Image(systemName: "arrow.up.right.square")
                }
            }
        }
        .padding(12)
        .background(.thinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}
