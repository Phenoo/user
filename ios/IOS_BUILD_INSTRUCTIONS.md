# iOS App Build Instructions (SwiftUI)

This document provides comprehensive instructions for building an iOS version of the Student App using SwiftUI.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Project Setup](#project-setup)
4. [Architecture](#architecture)
5. [Features to Implement](#features-to-implement)
6. [Convex Integration](#convex-integration)
7. [Authentication](#authentication)
8. [Core Modules](#core-modules)
9. [UI Components](#ui-components)
10. [Testing](#testing)
11. [Deployment](#deployment)

---

## Project Overview

Build a native iOS app that mirrors the functionality of the Next.js web application. The app should provide students with tools for:

- Course management and GPA tracking
- Flashcard creation and spaced repetition study
- Pomodoro timer for focused study sessions
- Study groups and collaboration
- AI-powered study assistance
- Task management
- Calendar and scheduling

---

## Prerequisites

### Required Software
- **Xcode 15.0+** (latest stable version)
- **macOS Sonoma 14.0+** or later
- **iOS 17.0+** as minimum deployment target
- **Swift 5.9+**
- **CocoaPods** or **Swift Package Manager** for dependencies

### Required Accounts
- Apple Developer Account ($99/year for App Store distribution)
- Convex account (for backend)
- OpenAI API key (for AI features)
- Google Cloud Console project (for Google Sign-In)

---

## Project Setup

### 1. Create New Xcode Project

```bash
# Open Xcode and create a new project
# Select: iOS > App
# Product Name: StudentApp
# Team: Your Apple Developer Team
# Organization Identifier: com.yourcompany
# Interface: SwiftUI
# Language: Swift
# Storage: None (we'll use Convex)
```

### 2. Project Structure

```
StudentApp/
├── App/
│   ├── StudentApp.swift              # Main app entry point
│   └── AppDelegate.swift             # App lifecycle
├── Core/
│   ├── Authentication/
│   │   ├── AuthManager.swift
│   │   ├── GoogleSignIn.swift
│   │   └── KeychainManager.swift
│   ├── Networking/
│   │   ├── ConvexClient.swift
│   │   ├── APIClient.swift
│   │   └── NetworkMonitor.swift
│   └── Storage/
│       ├── UserDefaults+Extensions.swift
│       └── CacheManager.swift
├── Features/
│   ├── Dashboard/
│   │   ├── DashboardView.swift
│   │   ├── DashboardViewModel.swift
│   │   └── Components/
│   ├── Courses/
│   │   ├── CoursesView.swift
│   │   ├── CourseDetailView.swift
│   │   ├── AddCourseSheet.swift
│   │   └── CoursesViewModel.swift
│   ├── Flashcards/
│   │   ├── FlashcardsView.swift
│   │   ├── DeckView.swift
│   │   ├── StudySessionView.swift
│   │   └── FlashcardsViewModel.swift
│   ├── Pomodoro/
│   │   ├── PomodoroView.swift
│   │   ├── PomodoroTimerView.swift
│   │   └── PomodoroViewModel.swift
│   ├── StudyGroups/
│   │   ├── StudyGroupsView.swift
│   │   ├── GroupDetailView.swift
│   │   ├── GroupChatView.swift
│   │   └── StudyGroupsViewModel.swift
│   ├── Tasks/
│   │   ├── TasksView.swift
│   │   ├── TaskDetailView.swift
│   │   └── TasksViewModel.swift
│   ├── Chat/
│   │   ├── ChatView.swift
│   │   ├── ChatBubble.swift
│   │   └── ChatViewModel.swift
│   ├── Calendar/
│   │   ├── CalendarView.swift
│   │   ├── EventDetailView.swift
│   │   └── CalendarViewModel.swift
│   └── Settings/
│       ├── SettingsView.swift
│       ├── ProfileView.swift
│       └── SettingsViewModel.swift
├── Shared/
│   ├── Components/
│   │   ├── LoadingView.swift
│   │   ├── EmptyStateView.swift
│   │   ├── ErrorView.swift
│   │   ├── CustomButton.swift
│   │   └── CardView.swift
│   ├── Extensions/
│   │   ├── Color+Extensions.swift
│   │   ├── View+Extensions.swift
│   │   └── Date+Extensions.swift
│   ├── Models/
│   │   ├── User.swift
│   │   ├── Course.swift
│   │   ├── Flashcard.swift
│   │   ├── StudyGroup.swift
│   │   └── Task.swift
│   └── Utilities/
│       ├── Constants.swift
│       └── Helpers.swift
├── Resources/
│   ├── Assets.xcassets
│   ├── Localizable.strings
│   └── Info.plist
└── Tests/
    ├── UnitTests/
    └── UITests/
```

### 3. Add Dependencies (Package.swift or SPM in Xcode)

```swift
// In Xcode: File > Add Package Dependencies

// Required packages:
// 1. Convex Swift Client (if available) or use REST API
//    https://github.com/get-convex/convex-swift (check availability)

// 2. Google Sign-In
//    https://github.com/google/GoogleSignIn-iOS

// 3. OpenAI Swift
//    https://github.com/MacPaw/OpenAI

// 4. Keychain Access
//    https://github.com/kishikawakatsumi/KeychainAccess

// 5. SDWebImageSwiftUI (for async images)
//    https://github.com/SDWebImage/SDWebImageSwiftUI
```

---

## Architecture

### MVVM Architecture

Use the **Model-View-ViewModel (MVVM)** pattern with SwiftUI:

```swift
// Example: CoursesViewModel.swift
import SwiftUI
import Combine

@MainActor
class CoursesViewModel: ObservableObject {
    @Published var courses: [Course] = []
    @Published var isLoading = false
    @Published var error: Error?

    private let convexClient: ConvexClient
    private var cancellables = Set<AnyCancellable>()

    init(convexClient: ConvexClient = .shared) {
        self.convexClient = convexClient
    }

    func fetchCourses() async {
        isLoading = true
        defer { isLoading = false }

        do {
            courses = try await convexClient.query("courses.getAllCourses", args: [:])
        } catch {
            self.error = error
        }
    }

    func addCourse(_ course: Course) async throws {
        try await convexClient.mutation("courses.addCourse", args: course.toDictionary())
        await fetchCourses()
    }
}
```

### Dependency Injection

```swift
// App/Dependencies.swift
import SwiftUI

class Dependencies: ObservableObject {
    let convexClient: ConvexClient
    let authManager: AuthManager
    let networkMonitor: NetworkMonitor

    init() {
        self.convexClient = ConvexClient()
        self.authManager = AuthManager()
        self.networkMonitor = NetworkMonitor()
    }
}

// In StudentApp.swift
@main
struct StudentApp: App {
    @StateObject private var dependencies = Dependencies()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(dependencies)
        }
    }
}
```

---

## Features to Implement

### Phase 1: Core Features (Week 1-2)

| Feature | Priority | Complexity |
|---------|----------|------------|
| Authentication (Google Sign-In) | High | Medium |
| Dashboard Overview | High | Low |
| Course Management | High | Medium |
| Navigation & Tab Bar | High | Low |

### Phase 2: Study Features (Week 3-4)

| Feature | Priority | Complexity |
|---------|----------|------------|
| Flashcard Decks | High | Medium |
| Flashcard Study Session | High | High |
| Pomodoro Timer | Medium | Medium |
| Task Management | Medium | Medium |

### Phase 3: Collaboration (Week 5-6)

| Feature | Priority | Complexity |
|---------|----------|------------|
| Study Groups List | Medium | Medium |
| Group Chat | Medium | High |
| Group Invites | Medium | Medium |
| Shared Content | Low | Medium |

### Phase 4: AI & Advanced (Week 7-8)

| Feature | Priority | Complexity |
|---------|----------|------------|
| AI Chat Assistant | Medium | High |
| AI Study Suggestions | Low | High |
| Analytics Dashboard | Low | Medium |
| Settings & Profile | Low | Low |

---

## Convex Integration

### Option 1: REST API (Recommended for iOS)

Since Convex may not have an official Swift SDK, use the REST API:

```swift
// Core/Networking/ConvexClient.swift
import Foundation

class ConvexClient {
    static let shared = ConvexClient()

    private let baseURL: URL
    private let session: URLSession
    private var authToken: String?

    init() {
        // Use the Convex HTTP API endpoint
        self.baseURL = URL(string: "https://YOUR_DEPLOYMENT.convex.cloud")!
        self.session = URLSession.shared
    }

    func setAuthToken(_ token: String) {
        self.authToken = token
    }

    // Query function
    func query<T: Decodable>(_ functionName: String, args: [String: Any] = [:]) async throws -> T {
        let url = baseURL.appendingPathComponent("api/query")
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if let token = authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        let body: [String: Any] = [
            "path": functionName,
            "args": args
        ]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw ConvexError.requestFailed
        }

        return try JSONDecoder().decode(T.self, from: data)
    }

    // Mutation function
    func mutation<T: Decodable>(_ functionName: String, args: [String: Any] = [:]) async throws -> T {
        let url = baseURL.appendingPathComponent("api/mutation")
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if let token = authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        let body: [String: Any] = [
            "path": functionName,
            "args": args
        ]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw ConvexError.requestFailed
        }

        return try JSONDecoder().decode(T.self, from: data)
    }
}

enum ConvexError: Error {
    case requestFailed
    case decodingFailed
    case unauthorized
}
```

### Option 2: WebSocket for Real-time Updates

```swift
// Core/Networking/ConvexWebSocket.swift
import Foundation

class ConvexWebSocket: NSObject, URLSessionWebSocketDelegate {
    private var webSocket: URLSessionWebSocketTask?
    private let url: URL

    var onMessage: ((Data) -> Void)?

    init(url: URL) {
        self.url = url
        super.init()
    }

    func connect() {
        let session = URLSession(configuration: .default, delegate: self, delegateQueue: nil)
        webSocket = session.webSocketTask(with: url)
        webSocket?.resume()
        receiveMessage()
    }

    private func receiveMessage() {
        webSocket?.receive { [weak self] result in
            switch result {
            case .success(let message):
                switch message {
                case .data(let data):
                    self?.onMessage?(data)
                case .string(let string):
                    if let data = string.data(using: .utf8) {
                        self?.onMessage?(data)
                    }
                @unknown default:
                    break
                }
                self?.receiveMessage()
            case .failure(let error):
                print("WebSocket error: \(error)")
            }
        }
    }

    func disconnect() {
        webSocket?.cancel(with: .normalClosure, reason: nil)
    }
}
```

---

## Authentication

### Google Sign-In Setup

1. **Configure in Google Cloud Console:**
   - Create iOS OAuth 2.0 Client ID
   - Add your Bundle ID
   - Download `GoogleService-Info.plist`

2. **Add URL Scheme in Info.plist:**
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>com.googleusercontent.apps.YOUR_CLIENT_ID</string>
        </array>
    </dict>
</array>
```

3. **Implement AuthManager:**

```swift
// Core/Authentication/AuthManager.swift
import SwiftUI
import GoogleSignIn

@MainActor
class AuthManager: ObservableObject {
    @Published var currentUser: User?
    @Published var isAuthenticated = false
    @Published var isLoading = false

    private let convexClient: ConvexClient

    init(convexClient: ConvexClient = .shared) {
        self.convexClient = convexClient
        checkExistingSession()
    }

    func signInWithGoogle() async throws {
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let rootViewController = windowScene.windows.first?.rootViewController else {
            throw AuthError.noRootViewController
        }

        let result = try await GIDSignIn.sharedInstance.signIn(withPresenting: rootViewController)

        guard let idToken = result.user.idToken?.tokenString else {
            throw AuthError.noIdToken
        }

        // Exchange Google token for Convex auth
        let user: User = try await convexClient.mutation("auth.googleSignIn", args: [
            "idToken": idToken,
            "email": result.user.profile?.email ?? "",
            "name": result.user.profile?.name ?? ""
        ])

        self.currentUser = user
        self.isAuthenticated = true

        // Store token securely
        try KeychainManager.shared.save(idToken, for: "authToken")
    }

    func signOut() {
        GIDSignIn.sharedInstance.signOut()
        currentUser = nil
        isAuthenticated = false
        try? KeychainManager.shared.delete("authToken")
    }

    private func checkExistingSession() {
        if let token = try? KeychainManager.shared.get("authToken") {
            convexClient.setAuthToken(token)
            Task {
                await restoreSession()
            }
        }
    }

    private func restoreSession() async {
        do {
            let user: User = try await convexClient.query("users.currentUser", args: [:])
            self.currentUser = user
            self.isAuthenticated = true
        } catch {
            signOut()
        }
    }
}

enum AuthError: Error {
    case noRootViewController
    case noIdToken
    case signInFailed
}
```

---

## Core Modules

### 1. Dashboard

```swift
// Features/Dashboard/DashboardView.swift
import SwiftUI

struct DashboardView: View {
    @StateObject private var viewModel = DashboardViewModel()
    @EnvironmentObject var authManager: AuthManager

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Greeting
                    HStack {
                        VStack(alignment: .leading) {
                            Text("Hello, \(authManager.currentUser?.name ?? "Student")!")
                                .font(.largeTitle)
                                .fontWeight(.bold)
                        }
                        Spacer()
                    }
                    .padding(.horizontal)

                    // Quick Stats
                    LazyVGrid(columns: [
                        GridItem(.flexible()),
                        GridItem(.flexible())
                    ], spacing: 16) {
                        StatCard(title: "GPA", value: viewModel.gpa, icon: "chart.line.uptrend.xyaxis")
                        StatCard(title: "Tasks", value: "\(viewModel.pendingTasks)", icon: "checkmark.circle")
                        StatCard(title: "Study Time", value: viewModel.studyTime, icon: "clock")
                        StatCard(title: "Streak", value: "\(viewModel.streak) days", icon: "flame")
                    }
                    .padding(.horizontal)

                    // Course Progress
                    CourseProgressSection(courses: viewModel.courses)

                    // Today's Events
                    TodayEventsSection(events: viewModel.todayEvents)

                    // Study Groups
                    StudyGroupsSection(groups: viewModel.studyGroups)
                }
                .padding(.vertical)
            }
            .navigationTitle("Dashboard")
            .refreshable {
                await viewModel.refresh()
            }
        }
        .task {
            await viewModel.loadData()
        }
    }
}
```

### 2. Flashcard Study Session

```swift
// Features/Flashcards/StudySessionView.swift
import SwiftUI

struct StudySessionView: View {
    @StateObject private var viewModel: StudySessionViewModel
    @State private var cardOffset: CGSize = .zero
    @State private var showAnswer = false
    @Environment(\.dismiss) private var dismiss

    init(deck: FlashcardDeck) {
        _viewModel = StateObject(wrappedValue: StudySessionViewModel(deck: deck))
    }

    var body: some View {
        VStack {
            // Progress
            ProgressView(value: viewModel.progress)
                .padding()

            Text("\(viewModel.currentIndex + 1) / \(viewModel.totalCards)")
                .font(.caption)
                .foregroundColor(.secondary)

            Spacer()

            // Flashcard
            if let card = viewModel.currentCard {
                FlashcardView(card: card, showAnswer: showAnswer)
                    .offset(cardOffset)
                    .rotationEffect(.degrees(Double(cardOffset.width / 20)))
                    .gesture(
                        DragGesture()
                            .onChanged { value in
                                cardOffset = value.translation
                            }
                            .onEnded { value in
                                handleSwipe(value.translation.width)
                            }
                    )
                    .onTapGesture {
                        withAnimation(.spring()) {
                            showAnswer.toggle()
                        }
                    }
            }

            Spacer()

            // Confidence Buttons
            if showAnswer {
                HStack(spacing: 20) {
                    ConfidenceButton(level: .hard, color: .red) {
                        viewModel.markCard(.hard)
                        nextCard()
                    }
                    ConfidenceButton(level: .good, color: .yellow) {
                        viewModel.markCard(.good)
                        nextCard()
                    }
                    ConfidenceButton(level: .easy, color: .green) {
                        viewModel.markCard(.easy)
                        nextCard()
                    }
                }
                .padding()
            }
        }
        .navigationTitle("Study Session")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func handleSwipe(_ width: CGFloat) {
        if abs(width) > 100 {
            let confidence: Confidence = width > 0 ? .easy : .hard
            viewModel.markCard(confidence)
            nextCard()
        } else {
            withAnimation(.spring()) {
                cardOffset = .zero
            }
        }
    }

    private func nextCard() {
        withAnimation(.spring()) {
            cardOffset = .zero
            showAnswer = false
        }
        viewModel.nextCard()
    }
}

struct FlashcardView: View {
    let card: Flashcard
    let showAnswer: Bool

    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 20)
                .fill(Color(.systemBackground))
                .shadow(radius: 10)

            VStack {
                Text(showAnswer ? card.back : card.front)
                    .font(.title2)
                    .multilineTextAlignment(.center)
                    .padding()

                if !showAnswer {
                    Text("Tap to reveal")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .frame(height: 300)
        .padding(.horizontal, 20)
        .rotation3DEffect(
            .degrees(showAnswer ? 180 : 0),
            axis: (x: 0, y: 1, z: 0)
        )
    }
}
```

### 3. Pomodoro Timer

```swift
// Features/Pomodoro/PomodoroView.swift
import SwiftUI

struct PomodoroView: View {
    @StateObject private var viewModel = PomodoroViewModel()

    var body: some View {
        NavigationStack {
            VStack(spacing: 40) {
                // Timer Display
                ZStack {
                    Circle()
                        .stroke(Color.gray.opacity(0.2), lineWidth: 20)

                    Circle()
                        .trim(from: 0, to: viewModel.progress)
                        .stroke(viewModel.timerColor, style: StrokeStyle(lineWidth: 20, lineCap: .round))
                        .rotationEffect(.degrees(-90))
                        .animation(.linear(duration: 1), value: viewModel.progress)

                    VStack {
                        Text(viewModel.timeString)
                            .font(.system(size: 60, weight: .bold, design: .monospaced))

                        Text(viewModel.sessionType.rawValue)
                            .font(.headline)
                            .foregroundColor(.secondary)
                    }
                }
                .frame(width: 280, height: 280)

                // Course Selector
                if viewModel.sessionType == .pomodoro {
                    Picker("Course", selection: $viewModel.selectedCourse) {
                        Text("Select Course").tag(nil as Course?)
                        ForEach(viewModel.courses) { course in
                            Text(course.name).tag(course as Course?)
                        }
                    }
                    .pickerStyle(.menu)
                }

                // Controls
                HStack(spacing: 40) {
                    Button {
                        viewModel.reset()
                    } label: {
                        Image(systemName: "arrow.counterclockwise")
                            .font(.title)
                    }
                    .disabled(!viewModel.isRunning && viewModel.timeRemaining == viewModel.totalTime)

                    Button {
                        viewModel.toggleTimer()
                    } label: {
                        Image(systemName: viewModel.isRunning ? "pause.fill" : "play.fill")
                            .font(.system(size: 50))
                    }

                    Button {
                        viewModel.skip()
                    } label: {
                        Image(systemName: "forward.fill")
                            .font(.title)
                    }
                }

                // Session Counter
                HStack {
                    ForEach(0..<4) { index in
                        Circle()
                            .fill(index < viewModel.completedPomodoros ? Color.accentColor : Color.gray.opacity(0.3))
                            .frame(width: 12, height: 12)
                    }
                }

                Spacer()
            }
            .padding()
            .navigationTitle("Pomodoro")
        }
    }
}
```

---

## UI Components

### Design System

```swift
// Shared/Components/DesignSystem.swift
import SwiftUI

// MARK: - Colors
extension Color {
    static let appPrimary = Color("Primary")
    static let appSecondary = Color("Secondary")
    static let appBackground = Color("Background")
    static let appCard = Color("Card")
}

// MARK: - Typography
extension Font {
    static let appTitle = Font.system(size: 28, weight: .bold)
    static let appHeadline = Font.system(size: 20, weight: .semibold)
    static let appBody = Font.system(size: 16, weight: .regular)
    static let appCaption = Font.system(size: 12, weight: .regular)
}

// MARK: - Reusable Components
struct CardView<Content: View>: View {
    let content: Content

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        content
            .padding()
            .background(Color.appCard)
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.05), radius: 5, x: 0, y: 2)
    }
}

struct LoadingView: View {
    var body: some View {
        VStack {
            ProgressView()
                .scaleEffect(1.5)
            Text("Loading...")
                .font(.appCaption)
                .foregroundColor(.secondary)
                .padding(.top)
        }
    }
}

struct EmptyStateView: View {
    let icon: String
    let title: String
    let message: String
    let actionTitle: String?
    let action: (() -> Void)?

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 60))
                .foregroundColor(.secondary)

            Text(title)
                .font(.appHeadline)

            Text(message)
                .font(.appBody)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)

            if let actionTitle = actionTitle, let action = action {
                Button(actionTitle, action: action)
                    .buttonStyle(.borderedProminent)
            }
        }
        .padding()
    }
}
```

---

## Testing

### Unit Tests

```swift
// Tests/UnitTests/CoursesViewModelTests.swift
import XCTest
@testable import StudentApp

final class CoursesViewModelTests: XCTestCase {
    var viewModel: CoursesViewModel!
    var mockClient: MockConvexClient!

    override func setUp() {
        super.setUp()
        mockClient = MockConvexClient()
        viewModel = CoursesViewModel(convexClient: mockClient)
    }

    func testFetchCourses() async {
        // Given
        mockClient.mockCourses = [
            Course(id: "1", name: "Math 101", code: "MATH101", credits: 3)
        ]

        // When
        await viewModel.fetchCourses()

        // Then
        XCTAssertEqual(viewModel.courses.count, 1)
        XCTAssertEqual(viewModel.courses.first?.name, "Math 101")
    }

    func testAddCourse() async {
        // Given
        let newCourse = Course(id: "", name: "Physics", code: "PHY101", credits: 4)

        // When
        do {
            try await viewModel.addCourse(newCourse)
        } catch {
            XCTFail("Should not throw")
        }

        // Then
        XCTAssertTrue(mockClient.addCourseCalled)
    }
}
```

### UI Tests

```swift
// Tests/UITests/DashboardUITests.swift
import XCTest

final class DashboardUITests: XCTestCase {
    var app: XCUIApplication!

    override func setUp() {
        super.setUp()
        continueAfterFailure = false
        app = XCUIApplication()
        app.launchArguments = ["UI_TESTING"]
        app.launch()
    }

    func testDashboardLoads() {
        // Navigate to dashboard (after login)
        XCTAssertTrue(app.navigationBars["Dashboard"].exists)
    }

    func testNavigateToCourses() {
        app.tabBars.buttons["Courses"].tap()
        XCTAssertTrue(app.navigationBars["Courses"].exists)
    }
}
```

---

## Deployment

### 1. App Store Preparation

- [ ] Create App Store Connect listing
- [ ] Prepare screenshots for all device sizes
- [ ] Write app description and keywords
- [ ] Create privacy policy URL
- [ ] Set up App Privacy details

### 2. Build Configuration

```
// In Xcode Build Settings:
- Set Bundle Identifier: com.yourcompany.studentapp
- Set Version: 1.0.0
- Set Build: 1
- Enable App Transport Security exceptions if needed
- Configure push notification capabilities
```

### 3. TestFlight Distribution

1. Archive the app (Product > Archive)
2. Validate the archive
3. Upload to App Store Connect
4. Add internal/external testers in TestFlight

### 4. App Store Submission

1. Complete all App Store Connect metadata
2. Submit for review
3. Respond to any review feedback

---

## Environment Variables

Create a `Config.swift` file for environment-specific values:

```swift
// Shared/Utilities/Config.swift
import Foundation

enum Config {
    static let convexURL: String = {
        #if DEBUG
        return "https://YOUR_DEV_DEPLOYMENT.convex.cloud"
        #else
        return "https://YOUR_PROD_DEPLOYMENT.convex.cloud"
        #endif
    }()

    static let openAIKey: String = {
        guard let key = Bundle.main.object(forInfoDictionaryKey: "OPENAI_API_KEY") as? String else {
            fatalError("OpenAI API Key not found")
        }
        return key
    }()

    static let googleClientID: String = {
        guard let key = Bundle.main.object(forInfoDictionaryKey: "GOOGLE_CLIENT_ID") as? String else {
            fatalError("Google Client ID not found")
        }
        return key
    }()
}
```

---

## Resources

- [SwiftUI Documentation](https://developer.apple.com/documentation/swiftui)
- [Convex Documentation](https://docs.convex.dev)
- [Google Sign-In iOS Guide](https://developers.google.com/identity/sign-in/ios/start)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

---

## Timeline

| Week | Milestone |
|------|-----------|
| 1 | Project setup, authentication, basic navigation |
| 2 | Dashboard, course management |
| 3 | Flashcards feature |
| 4 | Pomodoro timer, task management |
| 5 | Study groups, chat |
| 6 | AI features integration |
| 7 | Polish, testing, bug fixes |
| 8 | TestFlight, App Store submission |

---

## Notes

1. **Offline Support**: Consider implementing Core Data or SwiftData for offline caching
2. **Push Notifications**: Set up APNs for study reminders and group messages
3. **Widgets**: Add iOS widgets for quick access to timers, tasks, and stats
4. **Watch App**: Consider a companion watchOS app for Pomodoro timer
5. **Siri Shortcuts**: Add Siri integration for starting study sessions

Good luck with the iOS build! 🍎
