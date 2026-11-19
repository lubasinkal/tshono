<template>
  <section class="wrap narrow">
    <p><NuxtLink to="/">← search</NuxtLink></p>

    <div class="dhead">
      <span class="chip">◉ about</span>
      <span class="updated">built in gaborone</span>
    </div>

    <h1 class="title">One search for every opportunity in Botswana.</h1>
    <p class="sub">
      Tshono puts jobs from across the country into one fast search, so you can find work without signing up
      or visiting ten different sites.
    </p>

    <div class="jobbody">
      <h3>What you get</h3>
      <ul>
        <li>Search by job title, company, sector, place and experience — every view has a shareable link.</li>
        <li>Job pages with the details that matter: location, closing date, pay where the employer gave it.</li>
        <li>Company and sector pages, plus live hiring data in <NuxtLink to="/insights">insights</NuxtLink>.</li>
        <li>No account needed to search or read a job. Jobseeker accounts are only for saving a profile and applying.</li>
      </ul>

      <h3>Where the jobs come from</h3>
      <p>
        Listings come from employers who post directly and from public job advertisements collected from
        other sites. Each listing links back to the original source, so you can always check the details and
        apply at the employer. We don't invent roles, and we remove listings once they close.
      </p>

      <h3>For employers</h3>
      <p>
        Posting a job is free. Employers can pay for featured placement at the top of search, or use a plan
        for unlimited posts and featured credits. See <NuxtLink to="/employers/billing">plans</NuxtLink> and
        <NuxtLink to="/employers/jobs/new">post a job</NuxtLink>.
      </p>

      <h3>Who runs it</h3>
      <p>
        Tshono is an independent project built and run from Gaborone, Botswana. Questions, corrections and
        requests about your data go to <NuxtLink to="/contact">contact</NuxtLink>.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'about · tshono',
  description: 'Tshono puts every opportunity in Botswana into one fast search. Built in Gaborone.',
})
</script>
