export const COLORS = {
    // Primary / Brand - Calmer Blue
    primary: "#3182CE",
    primaryDark: "#2C5282",
    primaryLight: "#63B3ED",

    // Secondary - Subtle Teal
    secondary: "#38B2AC",
    secondaryDark: "#2C7A7B",

    // Backgrounds - Cleaner Dark (Gunmetal/Navy tone instead of Pitch Black)
    background: "#1A202C",
    surface: "#2D3748",
    card: "#4A5568",

    // Text
    text: "#FFFFFF",
    textSecondary: "#A0AEC0",
    textMuted: "#718096",

    // Status
    success: "#48BB78",
    warning: "#ECC94B",
    error: "#F56565",
    info: "#4299E1",

    // Gradients (Subtle)
    gradientPrimary: ["#3182CE", "#4299E1"],
    gradientCard: ["#2D3748", "#2D3748"], // Effectively solid for now to reduce flashiness
};

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
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    glow: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
};

const theme = { COLORS, SIZES, FONTS, SHADOWS };
export default theme;
