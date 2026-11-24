<template>
  <section class="wrap narrow">
    <p><NuxtLink to="/">← search</NuxtLink></p>

    <div class="dhead">
      <span class="chip">◉ privacy</span>
      <span class="updated">updated 19 november 2026</span>
    </div>

    <h1 class="title">Your data.</h1>
    <p class="sub">
      What Tshono collects about you, why, who we share it with, and what you can do about it. This notice
      follows Botswana's Data Protection Act, 2024. Questions? <NuxtLink to="/contact">Ask us</NuxtLink>.
    </p>

    <div class="jobbody">
      <h3>Who we are</h3>
      <p>
        Tshono is run from Gaborone, Botswana. For the personal data described here, we are the data controller:
        we decide why and how it is used. Contact us at
        <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a>.
      </p>

      <h3>What we collect and why</h3>
      <ul>
        <li>
          <b>Visits and searches.</b> Pages you view, searches you run and jobs you open. We use this to see what
          works and to publish hiring trends. Our analytics (self-hosted Umami) sets no cookies.
        </li>
        <li>
          <b>Accounts.</b> Your name, email address, and a password stored as a hash (or a one-time sign-in code
          if you use one). A session cookie keeps you signed in. We need these to run your account.
        </li>
        <li>
          <b>Employers.</b> Company name and details, your contact name, phone, email and address, the jobs you
          post, and the applications you receive. Some company contact details appear on public job and company
          pages so candidates know who they are dealing with.
        </li>
        <li>
          <b>Jobseekers.</b> Your headline, CV details (experience, education, skills, languages, phone), and any
          note you attach to an application. Your profile is private by default. It is shown to employers only if
          you switch on "visible to employers", and you can switch that off at any time.
        </li>
        <li>
          <b>Listings from other sites.</b> Some jobs are copied from public adverts. We keep the employer's
          published contact details and a link to the original advert so the listing can be checked.
        </li>
        <li>
          <b>Payments.</b> Polar handles checkout, invoices and cancellations. We receive your plan and order
          status. We never see or store your card details.
        </li>
        <li>
          <b>Messages.</b> If you email us, we keep your message and our reply so we can help you and keep a record
          of the request.
        </li>
      </ul>
      <p>
        Some information is required to do what you ask. For example, you need an email address to create an
        account, and you need company details to post a job. If you don't provide it, we can't offer that feature.
      </p>

      <h3>Why we can use it</h3>
      <p>
        We rely on the lawful grounds set out in the Act. Mostly that is:
      </p>
      <ul>
        <li><b>To provide the service you asked for</b>, such as your account, your applications and your job posts.</li>
        <li><b>Our legitimate interests</b> in running, securing and improving Tshono, and in keeping listings useful, where that does not outweigh your rights.</li>
        <li><b>Your written consent</b>, for example when you make your profile visible to employers. You can withdraw it in writing; the Act ties withdrawal to legitimate, reasonable and compelling grounds, so tell us your reason.</li>
        <li><b>Legal obligations</b>, such as keeping accounting records.</li>
      </ul>

      <h3>Who we share it with</h3>
      <p>
        Employers see the applications they receive and, if you have made your profile visible, your candidate
        profile. Jobseekers see employer contact details only where they are published on a job. We do not sell
        personal data.
      </p>
      <p>We use these service providers to run Tshono. They process data only on our instructions:</p>
      <ul>
        <li><b>Cloudflare Pages</b>: website hosting.</li>
        <li><b>Neon</b>: our database.</li>
        <li><b>Typesense</b>: job search.</li>
        <li><b>Resend</b>: sign-in and password reset emails.</li>
        <li><b>Polar</b>: payments, invoices and billing portal.</li>
        <li><b>Umami</b>: privacy-friendly website analytics, hosted by us.</li>
      </ul>
      <p>
        Our database is hosted by Neon on Amazon Web Services in Ohio, United States, so your personal data is
        transferred out of Botswana. Other providers listed above may also process data outside Botswana. Transfers
        out of Botswana are governed by the Act. Email us for details on a specific provider.
      </p>

      <h3>Cookies and local storage</h3>
      <ul>
        <li><b>Session cookie</b>: keeps you signed in. Needed for accounts.</li>
        <li><b>Local storage</b>: remembers your light or dark theme.</li>
      </ul>
      <p>
        We do not use advertising or cross-site tracking cookies. Our analytics does not set cookies.
      </p>

      <h3>How long we keep it</h3>
      <ul>
        <li><b>Job listings and company pages</b>: until the job closes or the company is removed.</li>
        <li><b>Accounts, profiles and applications</b>: until you delete them, or your account, yourself. Deleted data may remain in backups for a short time before they are overwritten.</li>
        <li><b>Billing records</b>: for as long as tax and accounting rules require.</li>
        <li><b>Analytics</b>: kept as aggregate statistics.</li>
      </ul>

      <h3 id="your-rights">Your rights</h3>
      <p>Under the Act you can ask us to:</p>
      <ul>
        <li>confirm whether we hold personal data about you, and give you a copy within a reasonable time;</li>
        <li>tell you the reason if we refuse a request;</li>
        <li>challenge the data we hold, and have it corrected, completed or deleted if the challenge succeeds.</li>
      </ul>
      <p>
        To use any of these, email <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a> from the address on
        your account and say what you want. We may ask you to confirm your identity first. Any charge will be
        reasonable, and we will tell you before charging anything.
      </p>
      <p>
        You can also complain to the Information and Data Protection Commission. We'd appreciate the chance to
        fix the problem first.
      </p>

      <h3>Security and breaches</h3>
      <p>
        We protect personal data with access controls, encrypted connections and limits on who can see what. If
        a breach affects your data, we will notify the Information and Data Protection Commission without delay and,
        where feasible, within 72 hours, and tell the people affected.
      </p>

      <h3>Children</h3>
      <p>
        The Act treats personal data of minors as sensitive. Tshono is for work and hiring, and we do not knowingly
        collect personal data from minors. If you believe a minor has given us their data, email us and we will delete it.
      </p>

      <h3>Changes to this notice</h3>
      <p>
        If we change how we use personal data, we will update this page and the date at the top. Significant
        changes will be flagged on the site.
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
