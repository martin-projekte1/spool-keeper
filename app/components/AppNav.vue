<script lang="ts" setup>
const {clear, loggedIn} = useUserSession()

async function logout() {
  await clear() // Clears the session cookie
  await navigateTo('/login') // Redirects to login page
}
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink class="flex items-center gap-2 font-semibold font-heading" to="/">
        <UIcon class="size-5 text-primary" name="i-lucide-spool"/>
        Spool Keeper
      </NuxtLink>
    </template>

    <UNavigationMenu
        :items="[
    { label: 'Overview', to: '/' },
    { label: 'Print', to: '/print' },
    { label: 'Specs', to: '/specs' },
    { label: 'Settings', to: '/settings' },
    ]"
        color="neutral"
        variant="link"
    />

    <template #body>
      <UNavigationMenu
          :items="[
      { label: 'Overview',  to: '/' },
      { label: 'Print',     to: '/print' },
      { label: 'Specs',     to: '/specs' },
      { label: 'Settings',  to: '/settings' },
    ]"
          color="neutral"
          orientation="vertical"
          variant="link"
      />
    </template>

    <template #right>
      <UColorModeButton/>

      <UButton
          v-if="loggedIn"
          aria-label="Log out"
          color="neutral"
          icon="i-lucide-log-out"
          variant="ghost"
          @click="logout"
      />
    </template>
  </UHeader>
</template>