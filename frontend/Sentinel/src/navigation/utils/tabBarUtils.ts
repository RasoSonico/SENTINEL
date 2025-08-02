import { Ionicons } from "@expo/vector-icons";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

export function getTabBarIconName(
  routeName: string,
  focused: boolean
): IoniconName {
  switch (routeName) {
    case "Home":
      return focused ? "home" : "home-outline";
    case "Obras":
      return focused ? "business" : "business-outline";
    case "Catalogos":
      return focused ? "list" : "list-outline";
    case "Cronogramas":
      return focused ? "calendar" : "calendar-outline";
    case "Avances":
      return focused ? "trending-up" : "trending-up-outline";
    case "Incidencias":
      return focused ? "warning" : "warning-outline";
    case "Perfil":
      return focused ? "person" : "person-outline";
    default:
      return "ellipse-outline";
  }
}
