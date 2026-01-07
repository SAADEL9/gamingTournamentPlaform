export const LightTheme = {
    primary: "#3182CE",
    primaryDark: "#2C5282",
    primaryLight: "#63B3ED",
    secondary: "#38B2AC",
    secondaryDark: "#2C7A7B",
    background: "#FFFFFF", // White background
    surface: "#F7FAFC",    // Very light grey for cards/surfaces
    card: "#FFFFFF",
    text: "#1A202C",       // Dark text
    textSecondary: "#718096",
    textMuted: "#A0AEC0",
    success: "#48BB78",
    warning: "#ECC94B",
    error: "#F56565",
    info: "#4299E1",
    border: "#E2E8F0",
    gradientPrimary: ["#3182CE", "#4299E1"],
    gradientCard: ["#FFFFFF", "#F7FAFC"],
};

export const DarkTheme = {
    primary: "#3182CE",
    primaryDark: "#2C5282",
    primaryLight: "#63B3ED",
    secondary: "#38B2AC",
    secondaryDark: "#2C7A7B",
    background: "#1A202C",
    surface: "#2D3748",
    card: "#4A5568",
    text: "#FFFFFF",
    textSecondary: "#A0AEC0",
    textMuted: "#718096",
    success: "#48BB78",
    warning: "#ECC94B",
    error: "#F56565",
    info: "#4299E1",
    border: "#2D3748",
    gradientPrimary: ["#3182CE", "#4299E1"],
    gradientCard: ["#2D3748", "#2D3748"],
};

export const COLORS = LightTheme; // Default to White/Light as requested

export const FONTS = {
    regular: "System",
    medium: "System",
    bold: "System",
};

export const SIZES = {
    h1: 26,
    h2: 22,
    h3: 18,
    body: 15,
    caption: 12,
    radius: 12,
    padding: 18,
};

export const SHADOWS = {
    light: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, // Softer for light theme
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1, // Softer for light theme
        shadowRadius: 8,
        elevation: 4,
    },
    glow: {
        shadowColor: LightTheme.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
};

const theme = { COLORS, SIZES, FONTS, SHADOWS, LightTheme, DarkTheme };
export default theme;
