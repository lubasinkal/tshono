<template>
  <section class="wrap narrow">
    <p><NuxtLink to="/">← search</NuxtLink></p>

    <div class="dhead">
      <span class="chip">◉ contact</span>
      <span class="updated">gaborone, botswana</span>
    </div>

    <h1 class="title">Talk to us.</h1>
    <p class="sub">
      Found a stale listing, a wrong location, or a job that should be taken down? Want to exercise a right
      over your personal data? Email us.
    </p>

    <div class="jobbody">
      <h3>Email</h3>
      <p>
        <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a>
      </p>

      <h3>What to include</h3>
      <ul>
        <li><b>Wrong listing:</b> the job link and what needs fixing.</li>
        <li><b>Employer help:</b> the company name and the email you used to sign up.</li>
        <li><b>Data request:</b> the email on your tshono account and which right you want to use. See
          <NuxtLink to="/privacy#your-rights">your data rights</NuxtLink>. We may ask for enough information to
          confirm it's you. We answer within one month unless the law allows longer.</li>
      </ul>

      <h3>Complaints</h3>
      <p>
        If you're not happy with how we handle a data request, you can complain to the Information and Data
        Protection Commission in Botswana. You can also read our
        <NuxtLink to="/privacy">privacy notice</NuxtLink> and <NuxtLink to="/terms">terms of use</NuxtLink>.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { CONTACT_EMAIL } from '~~/shared/constants'

useSeoMeta({ title: 'contact · tshono', description: 'Contact the team behind Tshono in Gaborone, Botswana.' })
</script>
