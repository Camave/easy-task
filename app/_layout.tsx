import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { IconButton, PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

function RouteGuard({children}: {children: React.ReactNode}) {
  const router = useRouter();
  const {user, isLoadingUser} = useAuth();
  const segments = useSegments();

  useEffect(() => {
    const inAuthGroup = segments[0] === "auth";
    if (!user && !inAuthGroup && !isLoadingUser) {
      router.replace("/auth");
    } else if (user && inAuthGroup && !isLoadingUser) {
      router.replace("/");
    }
  }, [user, segments]);

  return <>{children}</>;

}

export default function RootLayout() {
  return (
    <AuthProvider>
      <PaperProvider>
        <SafeAreaProvider>
          <RouteGuard>
            <Stack>
              <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
              <Stack.Screen
                name="modifier-profil"
                options={{
                  title: "Modifier ton profil",
                  headerLeft: () => {
                    const router = useRouter();
                    return (
                      <IconButton
                        icon="arrow-left"
                        onPress={() => router.back()}
                      />
                    );
                  },
                }}
              />
              <Stack.Screen
                name="profil_utilisateur"
                options={{
                  title: "Profil",
                  headerLeft: () => {
                    const router = useRouter();
                    return (
                      <IconButton
                        icon="arrow-left"
                        onPress={() => router.back()}
                      />
                    );
                  },
                }}
              />
              <Stack.Screen
                name="map"
                options={{
                  title: "Map",
                  headerLeft: () => {
                    const router = useRouter();
                    return (
                      <IconButton
                        icon="arrow-left"
                        onPress={() => router.back()}
                      />
                    );
                  },
                }}
              />
              <Stack.Screen
                name="TaskDetailScreen"
                options={{
                  title: "tache",
                  headerLeft: () => {
                    const router = useRouter();
                    return (
                      <IconButton
                        icon="arrow-left"
                        onPress={() => router.back()}
                      />
                    );
                  },
                }}
              />  
            </Stack>
          </RouteGuard>
        </SafeAreaProvider>
      </PaperProvider>
    </AuthProvider>
  );
}
