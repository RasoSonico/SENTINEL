import { StyleSheet, Dimensions } from "react-native";
import { DesignTokens, ColorUtils } from "../../../styles/designTokens";

// RESPONSIVE DESIGN UTILITIES
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const isTablet = screenWidth >= 768;
const isSmallPhone = screenWidth < 375;

// RESPONSIVE SPACING
const getResponsiveSpacing = (base: number) => {
  if (isTablet) return base * 1.5;
  if (isSmallPhone) return base * 0.8;
  return base;
};

// RESPONSIVE TYPOGRAPHY
const getResponsiveFontSize = (base: number) => {
  if (isTablet) return base * 1.2;
  if (isSmallPhone) return Math.max(base * 0.9, 12); // Mínimo 12px
  return base;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: DesignTokens.colors.background.secondary,
  },
  loadingText: {
    marginTop: getResponsiveSpacing(DesignTokens.spacing.lg),
    fontSize: getResponsiveFontSize(DesignTokens.typography.fontSize.base),
    color: DesignTokens.colors.neutral[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: DesignTokens.colors.background.secondary,
    paddingHorizontal: getResponsiveSpacing(DesignTokens.spacing["3xl"]),
  },
  errorTitle: {
    fontSize: getResponsiveFontSize(DesignTokens.typography.fontSize.xl),
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.error[600],
    marginTop: getResponsiveSpacing(DesignTokens.spacing.lg),
    textAlign: "center",
  },
  errorMessage: {
    fontSize: getResponsiveFontSize(DesignTokens.typography.fontSize.base),
    color: DesignTokens.colors.neutral[600],
    marginTop: getResponsiveSpacing(DesignTokens.spacing.sm),
    textAlign: "center",
    lineHeight: DesignTokens.typography.lineHeight.relaxed,
    maxWidth: 280,
  },
  retryButton: {
    backgroundColor: DesignTokens.colors.primary[500],
    paddingHorizontal: getResponsiveSpacing(DesignTokens.spacing["2xl"]),
    paddingVertical: getResponsiveSpacing(DesignTokens.spacing.md),
    borderRadius: DesignTokens.borderRadius.base,
    marginTop: getResponsiveSpacing(DesignTokens.spacing["2xl"]),
    ...DesignTokens.shadows.sm,
  },
  retryButtonText: {
    color: DesignTokens.colors.background.primary,
    fontSize: getResponsiveFontSize(DesignTokens.typography.fontSize.base),
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  header: {
    backgroundColor: DesignTokens.colors.background.primary,
    paddingHorizontal: getResponsiveSpacing(DesignTokens.spacing.lg),
    paddingTop: getResponsiveSpacing(DesignTokens.spacing.lg),
    paddingBottom: getResponsiveSpacing(DesignTokens.spacing.md),
    marginBottom: getResponsiveSpacing(DesignTokens.spacing["2xl"]),
    ...DesignTokens.shadows.sm,
  },
  title: {
    fontSize: getResponsiveFontSize(DesignTokens.typography.fontSize["2xl"]),
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.neutral[800],
    marginBottom: getResponsiveSpacing(DesignTokens.spacing.lg),
    includeFontPadding: false,
    lineHeight: getResponsiveFontSize(DesignTokens.typography.fontSize["2xl"]) * 1.3,
  },
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: getResponsiveSpacing(DesignTokens.spacing.lg),
    gap: getResponsiveSpacing(DesignTokens.spacing.sm),
  },
  filterButton: {
    height: getResponsiveSpacing(36),
    paddingHorizontal: getResponsiveSpacing(DesignTokens.spacing.sm),
    borderRadius: getResponsiveSpacing(18),
    backgroundColor: DesignTokens.colors.neutral[100],
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[200],
    justifyContent: "center",
    alignItems: "center",
    minWidth: getResponsiveSpacing(60),
  },
  filterButtonActive: {
    backgroundColor: DesignTokens.colors.primary[500],
    borderColor: DesignTokens.colors.primary[500],
    ...DesignTokens.shadows.sm,
  },
  filterButtonText: {
    fontSize: getResponsiveFontSize(DesignTokens.typography.fontSize.xs),
    color: DesignTokens.colors.neutral[600],
    fontWeight: DesignTokens.typography.fontWeight.medium,
    textAlign: "center",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  filterButtonTextActive: {
    color: DesignTokens.colors.background.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    textAlign: "center",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  statsContainer: {
    paddingTop: getResponsiveSpacing(DesignTokens.spacing.sm),
  },
  statsText: {
    fontSize: getResponsiveFontSize(DesignTokens.typography.fontSize.sm),
    color: DesignTokens.colors.neutral[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  footerLoader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: getResponsiveSpacing(DesignTokens.spacing.lg),
  },
  footerText: {
    marginLeft: getResponsiveSpacing(DesignTokens.spacing.sm),
    fontSize: getResponsiveFontSize(DesignTokens.typography.fontSize.sm),
    color: DesignTokens.colors.neutral[500],
  },
  // CONTENEDOR DE LISTA - IGUAL QUE ADVANCELISTSCREEN
  listContent: {
    padding: getResponsiveSpacing(DesignTokens.spacing.lg), // 16px como AdvanceListScreen
    paddingBottom: getResponsiveSpacing(DesignTokens.spacing["2xl"]), // 24px extra al final
  },
  emptyContainer: {
    flexGrow: 1,
    padding: getResponsiveSpacing(DesignTokens.spacing.lg),
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: getResponsiveSpacing(DesignTokens.spacing["3xl"]),
    paddingTop: getResponsiveSpacing(100),
  },
  emptyTitle: {
    fontSize: getResponsiveFontSize(DesignTokens.typography.fontSize.xl),
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.neutral[700],
    marginTop: getResponsiveSpacing(DesignTokens.spacing.lg),
    textAlign: "center",
  },
  emptyMessage: {
    fontSize: getResponsiveFontSize(DesignTokens.typography.fontSize.base),
    color: DesignTokens.colors.neutral[500],
    marginTop: getResponsiveSpacing(DesignTokens.spacing.sm),
    textAlign: "center",
    lineHeight: DesignTokens.typography.lineHeight.relaxed,
    maxWidth: 280,
  },
  // FLOATING ACTION BUTTON (FAB) - CONGRUENTE CON AVANCE
  fab: {
    position: "absolute",
    right: getResponsiveSpacing(20),
    bottom: getResponsiveSpacing(20),
    width: getResponsiveSpacing(56),
    height: getResponsiveSpacing(56),
    borderRadius: getResponsiveSpacing(28),
    backgroundColor: DesignTokens.colors.executive.primary, // MISMO COLOR DEL HEADER
    justifyContent: "center",
    alignItems: "center",
    ...DesignTokens.shadows.lg,
    // SOMBRA CONGRUENTE CON HEADER
    shadowColor: DesignTokens.colors.executive.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: DesignTokens.elevation.md,
    zIndex: DesignTokens.zIndex.fab,
  },
});

export default styles;