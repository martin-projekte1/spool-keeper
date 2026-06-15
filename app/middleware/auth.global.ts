export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession();

  if (to.path.startsWith("/_nuxt/")) return;
  if (/\.(css|html|ico|js|json|png|svg|webmanifest|webp)$/.test(to.path)) {
    return;
  }
  if (to.path === "/login") return;
  if (!loggedIn.value) return navigateTo("/login");
});
