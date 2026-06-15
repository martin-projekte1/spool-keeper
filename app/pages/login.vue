<script lang="ts" setup>
definePageMeta({ layout: false });

const route = useRoute();
const config = useRuntimeConfig();

const error = computed(() => route.query.error);
const isDevAuthBypass = computed(() => config.public.devAuthBypass);

function signIn() {
  // Forces full navigation - avoids the in-app browser overlay in iOS PWA mode
  window.location.assign("/auth/google");
}

function signInDemo() {
  window.location.assign("/auth/dev");
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-950 bg-[radial-gradient(#d4d4d4_1px,transparent_1px)] dark:bg-[radial-gradient(#262626_1px,transparent_1px)] bg-size-[16px_16px]"
  >
    <div class="absolute top-4 right-4">
      <UColorModeButton />
    </div>

    <div
      class="w-full max-w-md p-8 sm:p-10 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl shadow-2xl dark:shadow-black/50 text-center space-y-8"
    >
      <div class="space-y-2">
        <div
          class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500/10 text-primary-500 mb-4 ring-1 ring-primary-500/20"
        >
          <UIcon class="w-8 h-8" name="i-lucide-spool" />
        </div>
        <h1
          class="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white"
        >
          Spool Keeper
        </h1>
        <p class="text-neutral-500 dark:text-neutral-400">
          Filament Inventory Manager
        </p>
      </div>

      <div
        v-if="error"
        class="p-3 rounded-xl bg-red-500/10 border border-red-500/20"
      >
        <p
          v-if="error === 'unauthorized'"
          class="text-red-600 dark:text-red-400 text-sm font-medium"
        >
          Access denied. This Google account is not authorized.
        </p>
        <p v-else class="text-red-600 dark:text-red-400 text-sm font-medium">
          Login failed. Please try again.
        </p>
      </div>

      <UButton
        v-if="isDevAuthBypass"
        block
        class="font-semibold shadow-md"
        color="primary"
        icon="i-lucide-user"
        size="xl"
        variant="solid"
        @click="signInDemo"
      >
        Continue as Demo User
      </UButton>

      <a class="block" href="/auth/google" @click.prevent="signIn">
        <UButton
          block
          class="font-semibold shadow-md"
          :color="isDevAuthBypass ? 'neutral' : 'primary'"
          icon="i-lucide-log-in"
          size="xl"
          :variant="isDevAuthBypass ? 'outline' : 'solid'"
        >
          Sign in with Google
        </UButton>
      </a>
    </div>
  </div>
</template>
