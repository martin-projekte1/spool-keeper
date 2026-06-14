<template>
  <div class="flex flex-col min-h-screen">
    <AppNav />
    <UMain class="flex-1">
      <slot />
    </UMain>
    <AppFooter />
  </div>
</template>
