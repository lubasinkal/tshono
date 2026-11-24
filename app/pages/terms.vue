<template>
  <section class="wrap narrow">
    <p><NuxtLink to="/">← search</NuxtLink></p>

    <div class="dhead">
      <span class="chip">◉ terms</span>
      <span class="updated">updated 19 november 2026</span>
    </div>

    <h1 class="title">Terms of use.</h1>
    <p class="sub">
      The short version: use Tshono to find or advertise work, be honest about what you post, and don't misuse
      the service or other people's information.
    </p>

    <div class="jobbody">
      <h3>Using the site</h3>
      <p>
        You can browse and search jobs, and share job links, without an account. By using Tshono you agree to
        these terms. Don't try to break or overload the site, don't scrape it in bulk, and don't use it to harass
        anyone.
      </p>

      <h3>Job listings</h3>
      <p>
        Many listings come directly from employers. Others are copied from public adverts. We check what we can,
        but we don't verify every detail. Before you apply, check the role, closing date and how to apply on the
        original advert. Tshono does not guarantee a job, an interview, or that a listing is still open. We are not
        a party to any employment contract.
      </p>

      <h3>For employers</h3>
      <ul>
        <li>Post only real vacancies that you are allowed to advertise, and keep them accurate.</li>
        <li>Close roles once they are filled, and keep your contact details up to date.</li>
        <li>Once you receive applications, you are responsible for handling candidates' personal data in line with the Data Protection Act, 2024.</li>
        <li>Featured placement and paid plans are optional. Polar handles checkout and invoices. Manage them from your billing portal, or <NuxtLink to="/contact">contact us</NuxtLink>.</li>
      </ul>

      <h3>For jobseekers</h3>
      <p>
        Give accurate information in your profile and applications. Your profile is private unless you turn on
        "visible to employers". Don't post other people's details or documents without their permission.
      </p>

      <h3>Content and removal</h3>
      <p>
        You keep ownership of the job ads and company information you give us. By posting it, you allow us to show
        and index it on Tshono. We may correct, hide or remove a listing that is closed, duplicated, misleading or
        reported to us. We may also suspend accounts that misuse the service.
      </p>

      <h3>Liability</h3>
      <p>
        We work to keep Tshono accurate and available, but it is provided "as is". As far as Botswana law allows, we
        are not liable for losses from relying on a listing, applying for a job, or using the service. Nothing in
        these terms removes rights you have under the law.
      </p>

      <h3>Changes and governing law</h3>
      <p>
        These terms are governed by the laws of Botswana. We may update them as the service changes. The date at the
        top shows the current version. Questions? <NuxtLink to="/contact">Contact us</NuxtLink>. Your personal data
        is covered by our separate <NuxtLink to="/privacy">privacy notice</NuxtLink>.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'terms of use · tshono', description: 'The terms for using Tshono to find or advertise work in Botswana.' })
</script>
