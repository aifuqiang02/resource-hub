<script setup lang="ts">
import AppHeader from '@/components/layout/app-header.vue'

defineOptions({
  name: 'AgreementView',
})
</script>

<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark font-display">
    <AppHeader :show-nav="false" show-login />

    <!-- Main Content -->
    <main class="flex-grow py-12 px-4">
      <div class="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 md:p-12">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-8">用户协议</h1>
        
        <div class="prose prose-slate dark:prose-invert max-w-none">
          <h2 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">1. 服务条款</h2>
          <p class="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            欢迎使用臻享资源平台（以下简称"本平台"）。在使用本平台服务之前，请您仔细阅读本用户协议（以下简称"本协议"）。您通过网络页面点击确认或以其他方式选择接受本协议，即表示您与本平台已达成协议，同意接受本协议的全部约定内容。
          </p>

          <h2 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">2. 用户注册</h2>
          <p class="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            用户在使用本平台服务前需要注册账号。用户注册时应提供真实、准确、完整的个人信息和联系方式。如用户信息发生变更，应及时更新。因用户原因导致的账户安全问题和纠纷，由用户自行承担责任。
          </p>

          <h2 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">3. 资源发布与分享</h2>
          <p class="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            用户可以通过本平台登记并分享数字资源链接。当前平台仅支持填写 `123 云盘` 分享链接，不提供平台内文件上传服务。用户提交资源时必须符合以下要求：
          </p>
          <ul class="list-disc list-inside text-slate-600 dark:text-slate-400 leading-relaxed mb-4 space-y-2">
            <li>分享链接必须为真实、完整、可访问的 `123 云盘` 链接</li>
            <li>资源截图应与网盘实际内容一致，不得伪造或误导</li>
            <li>不得侵犯任何第三方的知识产权或其他合法权益</li>
            <li>不得违反国家法律法规和社会公序良俗</li>
            <li>资源描述应真实、准确，不得含有虚假或误导性信息</li>
          </ul>
          <p class="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            平台仅提供资源信息展示、审核和访问入口，不托管资源文件，也不维护资源版本列表。若分享链接失效或内容发生变化，发布者应自行更新链接、截图与说明。
          </p>

          <h2 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">4. 积分制度</h2>
          <p class="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            本平台采用积分制度。用户可以通过充值或发布优质资源获得积分。积分可用于获取平台资源访问入口，不可转让、提现。积分有效期根据充值时间计算，详情请参阅积分充值页面说明。
          </p>

          <h2 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">5. 知识产权</h2>
          <p class="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            用户登记分享的资源，知识产权归用户或原权利人所有。用户确认拥有该资源的完整知识产权或已获得合法授权。因用户提交的分享内容引发的知识产权纠纷，由用户自行解决并承担相应责任。
          </p>

          <h2 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">6. 隐私保护</h2>
          <p class="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            本平台尊重并保护用户的个人隐私。我们会采取合理的安全措施保护用户的个人信息，具体内容请参阅我们的隐私政策。
          </p>

          <h2 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">7. 服务变更与终止</h2>
          <p class="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            本平台保留随时修改或中断服务的权利。对于因服务变更或中断给用户造成的损失，本平台不承担责任，但会尽可能提前通知用户。
          </p>

          <h2 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">8. 免责声明</h2>
          <p class="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            本平台对用户提交的分享链接及其对应资源不承担任何担保责任。用户因使用本平台资源或第三方网盘内容而产生的任何直接或间接损失，由用户自行承担。因用户违反本协议导致的任何法律责任，由用户自行承担。
          </p>

          <h2 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">9. 协议修改</h2>
          <p class="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            本平台有权随时修改本协议。修改后的协议一经公布即生效。如果您不同意修改后的协议，有权停止使用本平台服务。继续使用本平台服务即表示您接受修改后的协议。
          </p>

          <h2 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">10. 其他</h2>
          <p class="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            本协议的订立、执行和解释均适用中华人民共和国法律。如因本协议产生争议，双方应友好协商解决；协商不成的，任一方可向本平台所在地有管辖权的人民法院提起诉讼。
          </p>

          <p class="text-slate-500 dark:text-slate-500 text-sm mt-12">
            最后更新日期：2026年3月30日
          </p>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 px-4">
      <div class="max-w-7xl mx-auto text-center text-sm text-slate-400">
        © 2024 臻享资源. All rights reserved.
      </div>
    </footer>
  </div>
</template>
