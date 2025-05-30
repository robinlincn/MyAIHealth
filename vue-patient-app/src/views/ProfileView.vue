<template>
  <div class="space-y-4 pb-4">
    <!-- Top Banner Section -->
    <div class="relative h-40 sm:h-48 md:h-40 rounded-lg overflow-hidden">
      <img
        src="https://picsum.photos/seed/profileheader-vue/600/240"
        alt="健康背景"
        class="absolute inset-0 w-full h-full object-cover opacity-80"
        data-ai-hint="health medical"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />
    </div>

    <!-- User Info and Doctor Card -->
    <VCard class="relative -mt-20 mx-2 shadow-xl">
      <VCardContent class="p-4 flex items-center space-x-4">
        <div class="flex flex-col items-center">
          <VAvatar class="h-20 w-20 border-4 border-background shadow-md">
            <VAvatarImage :src="mockUser.avatarUrl" :alt="mockUser.name" :data-ai-hint="mockUser.dataAiHint" />
            <VAvatarFallback class="text-2xl">{{ mockUser.name.substring(0, 1) }}</VAvatarFallback>
          </VAvatar>
          <p class="mt-2 text-lg font-semibold">{{ mockUser.name }}</p>
        </div>

        <div class="h-20 border-l border-border mx-2 sm:mx-4"></div>

        <div class="flex-1 text-center p-2 border border-primary/30 rounded-lg bg-background">
          <p class="text-sm font-medium text-primary">专属健康管理师</p>
          <VAvatar class="h-12 w-12 mx-auto my-1 border-2 border-primary/20">
            <VAvatarImage :src="mockDoctor.avatarUrl" :alt="mockDoctor.name" :data-ai-hint="mockDoctor.dataAiHint" />
            <VAvatarFallback>{{ mockDoctor.name.substring(0, 1) }}</VAvatarFallback>
          </VAvatar>
          <p class="text-sm text-muted-foreground mb-2">{{ mockDoctor.name }}</p>
          <RouterLink :to="VUE_APP_BASE_URL + 'dashboard/consultations'" class="w-full h-8 text-xs bg-green-500 hover:bg-green-600 text-white inline-flex items-center justify-center rounded-md px-3 py-1.5 font-medium">
            <Stethoscope class="mr-1 h-3 w-3" /> 询问医生
          </RouterLink>
        </div>
      </VCardContent>
    </VCard>

    <!-- Navigation Links -->
    <VCard class="mx-2 shadow-lg">
      <VCardContent class="p-0">
        <ul class="divide-y divide-border">
          <li v-for="linkItem in profileLinks" :key="linkItem.title">
            <RouterLink
              :to="linkItem.href"
              class="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <component :is="linkItem.icon" class="h-5 w-5 text-primary" />
                <span class="text-sm font-medium">{{ linkItem.title }}</span>
              </div>
              <ChevronRight class="h-5 w-5 text-muted-foreground" />
            </RouterLink>
          </li>
        </ul>
      </VCardContent>
    </VCard>

    <!-- Logout Button -->
    <VCard class="mx-2 shadow-lg">
      <VCardContent class="p-2">
        <button
          @click="handleLogout"
          class="w-full text-destructive hover:bg-destructive/10 hover:text-destructive font-medium flex items-center justify-center p-2.5 rounded-md"
        >
          <LogOut class="mr-2 h-4 w-4" />
          退出登录
        </button>
      </VCardContent>
    </VCard>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router';
import { VAvatar, VAvatarImage, VAvatarFallback } from '@/components/ui/VAvatar';
import { VCard, VCardContent } from '@/components/ui/VCard';
import { UserCircle, MessageSquare, CheckSquare, Activity, Smile, ChevronRight, LogOut, Stethoscope, FileText, Pill } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/authStore';

const VUE_APP_BASE_URL = import.meta.env.BASE_URL || '/vue-patient-app/';
const router = useRouter();
const authStore = useAuthStore();

const mockUser = {
  name: "王小宝 (Vue)",
  avatarUrl: "https://picsum.photos/seed/userprofile-vue/100/100",
  dataAiHint: "user portrait",
};

const mockDoctor = {
  name: "王医生",
  avatarUrl: "https://picsum.photos/seed/doctorprofile-vue/80/80",
  dataAiHint: "doctor professional",
};

const profileLinks = [
  { title: "健康档案", icon: FileText, href: VUE_APP_BASE_URL + 'dashboard/profile/edit-details' },
  { title: "用药计划", icon: Pill, href: VUE_APP_BASE_URL + 'dashboard/medication-plan' },
  { title: "在线咨询", icon: MessageSquare, href: VUE_APP_BASE_URL + 'dashboard/consultations' },
  { title: "我的打卡", icon: CheckSquare, href: VUE_APP_BASE_URL + 'dashboard/reminders' },
  { title: "健康指数", icon: Activity, href: VUE_APP_BASE_URL + 'dashboard/health-data' },
  { title: "联系我们", icon: Smile, href: VUE_APP_BASE_URL + 'dashboard/help' },
];

const handleLogout = () => {
  authStore.logout();
  router.push(VUE_APP_BASE_URL + 'auth/login');
};
</script>
