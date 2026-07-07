import SwiftUI

struct ImagePickerView: View {
    let image: UIImage?
    let onPickImage: () -> Void

    var body: some View {
        Button(action: onPickImage) {
            ZStack {
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color(.secondarySystemBackground))
                    .frame(height: 260)

                if let image {
                    Image(uiImage: image)
                        .resizable()
                        .scaledToFill()
                        .frame(maxWidth: .infinity)
                        .frame(height: 260)
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                } else {
                    VStack(spacing: 12) {
                        Image(systemName: "photo.badge.plus")
                            .font(.system(size: 44))
                        Text("Select Photo")
                            .font(.headline)
                    }
                    .foregroundStyle(.secondary)
                }
            }
        }
        .buttonStyle(.plain)
    }
}
