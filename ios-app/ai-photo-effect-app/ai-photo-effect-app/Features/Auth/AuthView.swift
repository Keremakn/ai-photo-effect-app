import SwiftUI

struct AuthView: View {
    @ObservedObject var viewModel: HomeViewModel
    @State private var mode: AuthMode = .login
    @State private var email = ""
    @State private var password = ""

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            VStack(alignment: .leading, spacing: 6) {
                Text("AI Photo Effects")
                    .font(.largeTitle.bold())
                Text(mode == .login ? "Sign in to keep your generation history." : "Create an account to start generating.")
                    .foregroundStyle(.secondary)
            }

            Picker("Mode", selection: $mode) {
                Text("Login").tag(AuthMode.login)
                Text("Register").tag(AuthMode.register)
            }
            .pickerStyle(.segmented)

            VStack(spacing: 12) {
                TextField("Email", text: $email)
                    .textInputAutocapitalization(.never)
                    .keyboardType(.emailAddress)
                    .textContentType(.emailAddress)
                    .autocorrectionDisabled()
                    .textFieldStyle(.roundedBorder)

                SecureField("Password", text: $password)
                    .textContentType(mode == .login ? .password : .newPassword)
                    .textFieldStyle(.roundedBorder)
            }

            Button {
                Task {
                    switch mode {
                    case .login:
                        await viewModel.login(email: email, password: password)
                    case .register:
                        await viewModel.register(email: email, password: password)
                    }
                }
            } label: {
                Label(mode == .login ? "Login" : "Create Account", systemImage: mode == .login ? "person.crop.circle.badge.checkmark" : "person.badge.plus")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)
            .disabled(email.isEmpty || password.isEmpty || viewModel.isLoading)

            if viewModel.isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity)
            }
        }
        .padding()
    }
}

private enum AuthMode {
    case login
    case register
}
