import SwiftUI

struct ProcessingView: View {
    var body: some View {
        HStack(spacing: 12) {
            ProgressView()
            Text("Processing")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.secondarySystemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}
