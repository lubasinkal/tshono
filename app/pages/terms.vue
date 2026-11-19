<template>
  <section class="wrap narrow">
    <p><NuxtLink to="/">← search</NuxtLink></p>

    <div class="dhead">
      <span class="chip">◉ terms</span>
      <span class="updated">updated 19 november 2026</span>
    </div>

    <h1 class="title">Terms of use.</h1>
    <p class="sub">
      The short version: use Tshono to find or advertise work, be honest in what you post, and don't misuse
      the service or other people's data.
    </p>

    <div class="jobbody">
      <h3>Using the site</h3>
      <p>
        You may browse, search and share job links without an account. By using Tshono you agree to these
        terms and to use the site lawfully. Don't attempt to break it, overload it, scrape it in bulk, or use
        it to harass people.
      </p>

      <h3>Job listings</h3>
      <p>
        Many listings come from employers directly; others come from public advertisements. We check what we
        can, but we don't verify every detail. Check the role, closing date and application route on the
        original source before you apply. Tshono doesn't guarantee an interview, a job, or that a listing is
        still open, and isn't a party to the employment contract.
      </p>

      <h3>For employers</h3>
      <ul>
        <li>Post only real vacancies you're allowed to advertise, and keep them accurate.</li>
        <li>Close roles that are filled and keep your contact details current.</li>
        <li>You are responsible for what happens to applications after you receive them, including handling candidates' personal data under Botswana's Data Protection Act, 2024.</li>
        <li>Featured placement and plans are optional. Checkout and invoices are handled by Ledger; manage them from your billing portal or <NuxtLink to="/contact">contact us</NuxtLink>.</li>
      </ul>

      <h3>For jobseekers</h3>
      <p>
        Give accurate information in your profile and applications. Your profile is private unless you turn
        on "visible to employers". Don't post other people's details or documents without their permission.
      </p>

      <h3>Content and removal</h3>
      <p>
        Employers keep ownership of the job ads and company information they supply, and grant us permission
        to display and index it on Tshono. We may correct, hide or remove a listing that is closed, duplicate,
        misleading or reported to us, and may block accounts that abuse the service.
      </p>

      <h3>Liability</h3>
      <p>
        We work to keep Tshono accurate and available, but it is provided "as is". To the extent allowed by
        Botswana law, we are not liable for losses from relying on a listing, applying to a job, or using the
        service. Nothing here limits rights you have under the law.
      </p>

      <h3>Changes and law</h3>
      <p>
        These terms are governed by the laws of Botswana. We may update them as the service changes; the date
        at the top shows the current version. Questions? <NuxtLink to="/contact">Contact us</NuxtLink>. Your
        personal data is covered by the separate <NuxtLink to="/privacy">privacy notice</NuxtLink>.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'terms of use · tshono', description: 'The terms for using Tshono to find or advertise work in Botswana.' })
</script>
