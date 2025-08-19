import { Home, Compass, User } from "lucide-react-native";

export const icons = {
    index: (props)=> <Home size={26} {...props} />,
    food_scan: (props)=> <Compass size={26} {...props} />,
    // create: (props)=> <AntDesign name="pluscircleo" size={26} {...props} />,
    profile: (props)=> <User size={26} {...props} />,
}
