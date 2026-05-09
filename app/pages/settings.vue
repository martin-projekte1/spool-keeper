<script lang="ts" setup>
const {user, clear} = useUserSession()

const language = ref('en')
const resetting = ref(false)
const deleting = ref(false)
const showDeleteConfirm = ref(false)

async function logout() {
  await clear()
  await navigateTo('/login')
}

async function resetData() {
  resetting.value = true
  try {
    await $fetch('/api/seed', {method: 'POST'})
    await navigateTo('/')
  } finally {
    resetting.value = false
  }
}

async function deleteAccount() {
  deleting.value = true
  try {
    await $fetch('/api/account', {method: 'DELETE'})
    await navigateTo('/login')
  } finally {
    deleting.value = false
    showDeleteConfirm.value = false
  }
}
</script>

<template>
  <UContainer class="py-8 max-w-3xl space-y-8">
    <UPageHeader
        description="Manage your account settings and preferences."
        title="Settings"
    />

    <UCard>
      <template #header>
        <p class="font-semibold">User Profile</p>
      </template>
      <div class="space-y-4">

        <div class="flex items-center gap-4 mb-6">
          <UAvatar :alt="user?.name" :src="user?.avatar" size="lg"/>
          <div>
            <p class="font-medium">{{ user?.name }}</p>
            <p class="text-sm text-neutral-400">Google Account</p>
          </div>
        </div>

        <UFormField label="Username" class="w-full">
          <UInput :model-value="user?.name" disabled icon="i-lucide-user" class="w-full"/>
        </UFormField>

        <UFormField label="Email" class="w-full">
          <UInput :model-value="user?.email" disabled icon="i-lucide-mail" type="email" class="w-full"/>
        </UFormField>

        <div class="pt-2">
          <UButton color="primary" icon="i-lucide-log-out" variant="solid" @click="logout">
            Sign out
          </UButton>
        </div>

      </div>
    </UCard>

    <UCard>
      <template #header>
        <p class="font-semibold">Language</p>
      </template>
      <USelect
          v-model="language"
          :items="[
          { label: 'English', value: 'en' },
        ]"
          class="max-w-xs"
      />
    </UCard>

    <UCard>
      <template #header>
        <p class="font-semibold text-error">Danger Zone</p>
      </template>

      <div class="flex flex-col gap-6">

        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="font-medium">Reset Demo Data</p>
            <p class="text-sm text-muted">Resets all filaments and spools to the default demo data.</p>
          </div>
          <UButton
              :loading="resetting"
              color="neutral"
              icon="i-lucide-refresh-cw"
              variant="outline"
              @click="resetData"
          >
            Reset
          </UButton>
        </div>

        <hr class="border-neutral-200 dark:border-neutral-800"/>

        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="font-medium">Delete Account</p>
            <p class="text-sm text-muted">Permanently deletes all your data & the account. You have to log in again nd
              demo data will repopulate the site.</p>
          </div>
          <UButton
              v-if="!showDeleteConfirm"
              color="error"
              icon="i-lucide-trash-2"
              variant="outline"
              @click="showDeleteConfirm = true"
          >
            Delete Account
          </UButton>
          <div v-else class="flex gap-2">
            <UButton color="neutral" variant="ghost" @click="showDeleteConfirm = false">
              Cancel
            </UButton>
            <UButton
                :loading="deleting"
                color="error"
                icon="i-lucide-trash-2"
                variant="solid"
                @click="deleteAccount"
            >
              Confirm
            </UButton>
          </div>
        </div>

      </div>
    </UCard>

  </UContainer>
</template>
