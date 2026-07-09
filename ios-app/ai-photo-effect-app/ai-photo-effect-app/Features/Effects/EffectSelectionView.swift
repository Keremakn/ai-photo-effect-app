import SwiftUI

struct EffectSelectionView: View {
    let effects: [Effect]
    let favoriteEffects: [Effect]
    let selectedEffect: Effect?
    let onSelect: (Effect) -> Void
    let onToggleFavorite: (Effect) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Effects")
                .font(.headline)

            if effects.isEmpty {
                ProgressView()
                    .frame(maxWidth: .infinity, minHeight: 84)
            } else {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 12) {
                        ForEach(orderedEffects) { effect in
                            EffectCardView(
                                effect: effect,
                                isSelected: selectedEffect == effect,
                                onTap: {
                                    onSelect(effect)
                                },
                                onToggleFavorite: {
                                    onToggleFavorite(effect)
                                }
                            )
                        }
                    }
                    .padding(.vertical, 2)
                }
            }
        }
    }

    private var orderedEffects: [Effect] {
        let favoriteIds = Set(favoriteEffects.map(\.id))
        return effects.sorted { first, second in
            if favoriteIds.contains(first.id) != favoriteIds.contains(second.id) {
                return favoriteIds.contains(first.id)
            }

            return first.name < second.name
        }
    }
}

private struct EffectCardView: View {
    let effect: Effect
    let isSelected: Bool
    let onTap: () -> Void
    let onToggleFavorite: () -> Void

    var body: some View {
        ZStack(alignment: .topTrailing) {
          Button(action: onTap) {
            VStack(alignment: .leading, spacing: 8) {
                Image(systemName: "camera.filters")
                    .font(.title2)
                    .foregroundStyle(isSelected ? .white : .blue)

                Text(effect.name)
                    .font(.headline)
                    .foregroundStyle(isSelected ? .white : .primary)

                Text(effect.description)
                    .font(.caption)
                    .foregroundStyle(isSelected ? .white.opacity(0.82) : .secondary)
                    .lineLimit(2)
                    .multilineTextAlignment(.leading)

                if let category = effect.category {
                    Text(category)
                        .font(.caption2.bold())
                        .foregroundStyle(isSelected ? .white.opacity(0.82) : .blue)
                }
            }
            .frame(width: 152, height: 112, alignment: .topLeading)
            .padding(12)
            .background(isSelected ? Color.blue : Color(.secondarySystemBackground))
            .clipShape(RoundedRectangle(cornerRadius: 8))
          }
          .buttonStyle(.plain)

          Button(action: onToggleFavorite) {
              Image(systemName: effect.isFavorite == true ? "heart.fill" : "heart")
                  .foregroundStyle(effect.isFavorite == true ? .red : .secondary)
                  .padding(8)
          }
          .buttonStyle(.plain)
        }
    }
}
