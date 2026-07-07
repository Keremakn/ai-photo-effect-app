import SwiftUI

struct EffectSelectionView: View {
    let effects: [Effect]
    let selectedEffect: Effect?
    let onSelect: (Effect) -> Void

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
                        ForEach(effects) { effect in
                            EffectCardView(
                                effect: effect,
                                isSelected: selectedEffect == effect,
                                onTap: {
                                    onSelect(effect)
                                }
                            )
                        }
                    }
                    .padding(.vertical, 2)
                }
            }
        }
    }
}

private struct EffectCardView: View {
    let effect: Effect
    let isSelected: Bool
    let onTap: () -> Void

    var body: some View {
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
            }
            .frame(width: 152, height: 112, alignment: .topLeading)
            .padding(12)
            .background(isSelected ? Color.blue : Color(.secondarySystemBackground))
            .clipShape(RoundedRectangle(cornerRadius: 8))
        }
        .buttonStyle(.plain)
    }
}
