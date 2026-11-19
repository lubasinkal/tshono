<template>
  <section class="wrap narrow">
    <p><NuxtLink to="/">← search</NuxtLink></p>

    <div class="dhead">
      <span class="chip">◉ privacy</span>
      <span class="updated">updated 19 november 2026</span>
    </div>

    <h1 class="title">Your data.</h1>
    <p class="sub">
      A plain-language notice explaining what Tshono does with personal data, under Botswana's Data
      Protection Act, 2024. If anything here is unclear, <NuxtLink to="/contact">ask us</NuxtLink>.
    </p>

    <div class="jobbody">
      <h3>Who is responsible</h3>
      <p>
        Tshono is operated from Gaborone, Botswana. For the Data Protection Act, we are the data controller
        for the personal data described here. Reach us at
        <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a>.
      </p>

      <h3>What we collect, and why</h3>
      <ul>
        <li>
          <b>Browsing and search.</b> We record page views, searches and job views so we know what works and
          can report hiring trends. Analytics runs on our own self-hosted Umami instance and uses no cookies.
          Basis: our legitimate interest in running and improving the service (s.26(f)).
        </li>
        <li>
          <b>Accounts.</b> Name, email, a hashed password (or one-time sign-in codes), and a session cookie
          that keeps you signed in. Basis: performing our contract with you (s.26(b)).
        </li>
        <li>
          <b>Employers.</b> Company details, contact name, phone, email, address, job ads and the applications
          you receive. Some company contact details are shown publicly on job and company pages so candidates
          know who they are dealing with. Basis: contract, and legitimate interest in keeping listings useful.
        </li>
        <li>
          <b>Jobseekers.</b> Your headline, CV details (experience, education, skills, languages, phone) and
          any note you attach to an application. This is private by default. Only if you switch on
          "visible to employers" can employers see your profile and phone in candidate search. Basis:
          contract; for that optional visibility, your consent (s.26(a)), which you can withdraw in your profile.
        </li>
        <li>
          <b>Listings from public sources.</b> Some job ads come from public advertisements on other sites.
          We keep the employer's published contact details and a link back to the source, so the listing can
          be checked. Basis: legitimate interest in giving jobseekers one place to search.
        </li>
        <li>
          <b>Payments.</b> Polar handles checkout, invoices and cancellations. We receive your plan and order
          status, but we never see or store your card details. Basis: contract and legal obligations around
          accounting records.
        </li>
        <li>
          <b>Messages.</b> If you email us, we keep the message and our reply so we can help you and keep a
          record of the request. Basis: legitimate interest and, where relevant, legal obligation.
        </li>
      </ul>
      <p>
        An email and password (or sign-in code) are needed for an account, and company and contact details are
        needed to publish a job. Without them we can't provide those features. There is no other legal requirement
        for you to give us personal data.
      </p>

      <h3>Who else can see it</h3>
      <p>
        Employers see applications to their own jobs and, if you opted in, your candidate profile. Jobseekers
        do not see employer contact data beyond what is published on a job ad. We don't sell personal data.
      </p>
      <p>
        Service providers process data on our behalf: Cloudflare Pages (hosting), Neon (database), Typesense
        (search), Resend (sign-in and reset emails), Polar (payments) and Umami (analytics). Some of these may
        process data outside Botswana. Cross-border transfers are covered by Part XIV of the Act (ss.74–78);
        email us if you want the safeguards that apply to a particular provider.
      </p>

      <h3>Cookies and local storage</h3>
      <p>
        We use a session cookie for signed-in accounts, and store your light/dark theme choice in your
        browser's local storage. Our analytics tracker is cookieless: it does not set cookies, and your IP is
        used only to calculate a rotating anonymous session identifier. No advertising or cross-site tracking
        cookies are used.
      </p>

      <h3>How long we keep it</h3>
      <ul>
        <li>Live jobs and public company pages: until the job is closed or the company is removed.</li>
        <li>Account, profile and application data: until you delete them or delete your account. Deleted records may persist briefly in backups before they are overwritten.</li>
        <li>Payment and billing records: for as long as tax and accounting rules require.</li>
        <li>Analytics: kept in aggregate on our own analytics server.</li>
      </ul>

      <h3 id="your-rights">Your rights</h3>
      <p>
        Under Part VIII of the Act (ss.37–49) you can ask us to give you access to your personal data, correct
        it, erase it, restrict how we use it, or provide a portable copy. You can object to processing
        (including direct marketing) and withdraw consent where we rely on it. Email
        <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a> with the email on your account and what
        you want us to do. We may ask for information to confirm it's you. We respond within one month unless
        the Act allows more time, and there is no fee unless a request is unfounded or excessive. You can also
        complain to the Information and Data Protection Commission (s.80).
      </p>
      <p>
        We don't make automated decisions about you that have legal or similarly significant effects. Job
        matches are just search results; a human decides whether to hire.
      </p>

      <h3>Security and breaches</h3>
      <p>
        We use appropriate technical and organisational measures to protect personal data, including access
        controls and encrypted connections. If a breach occurs, we assess the risk, notify the Commission
        where the Act requires (normally within 72 hours) and tell affected people where required (ss.62–64).
      </p>

      <h3>Children</h3>
      <p>
        Tshono is a work and hiring service, not aimed at children. We don't knowingly collect personal data
        from anyone under 16 without a parent or guardian's authorisation.
      </p>

      <h3>Changes to this notice</h3>
      <p>
        If we change how we handle personal data, we'll update this page and the date at the top. Material
        changes will be called out on the site.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { CONTACT_EMAIL } from '~~/shared/constants'

useSeoMeta({
  title: 'privacy & your data · tshono',
  description: 'How Tshono handles personal data under Botswana data protection law, and how to exercise your rights.',
})
</script>
