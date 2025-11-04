## Stage 3 — Pixel Perfect Audiophile Build

Welcome to Stage 3 — time to push beyond SaaS and tackle a real-world, pixel-perfect e-commerce build! In this stage, you’ll bring the Audiophile e-commerce Figma design to life using React/Next.js, integrate a backend with Convex, and implement a functional checkout that sends users a confirmation email.

### Figma (Pixel-perfect source of truth)

[Audiophile E-commerce Website] https://www.figma.com/design/jfDxXzGw2lfyJOgFGbJOW4/audiophile-ecommerce-website?node-id=0-7791&m=dev

### Requirements  

- **Must use React (Next.js strongly recommended).**
- Implement the Audiophile Figma design pixel perfectly across mobile, tablet, and desktop.

#### Checkout Form (Core Feature)  

- Collect user details (name, email, phone, shipping address, etc.).
- Validate all fields (inline errors + accessibility).
- Handle edge cases: invalid email, missing fields, invalid quantities, duplicate submissions, etc.

- On success:
	- Save order in Convex backend (store items, totals, user details).
	- Send order confirmation email with an HTML template.
	- Redirect to Order Confirmation Page with order summary.

#### Order Storage (Convex)  

- Store order data in Convex with:
	- Customer details
	- Shipping details
	- Items (id, name, price, quantity)
	- Totals (subtotal, shipping, taxes, grand total)
	- Order status & timestamp

#### Confirmation Email  

- Send a transactional email when checkout is successful.
- Email must include:
	- Greeting with user’s name
	- Order ID & summary of purchased items
	- Shipping details
	- Support/Contact info
	- CTA: “View your order” link
- Must be responsive and well-formatted.

### Acceptance Criteria 

- Pixel-perfect build: Matches Figma across all screen sizes.  
- Checkout works end-to-end: Orders saved in Convex, confirmation email sent.  
- Validation & edge cases handled: All error states clearly surfaced.  
- Order confirmation page: Displays full order summary.  
- Email template: Responsive, personalized, and successfully delivered.  
- Accessibility: Forms, navigation, and errors must be screen-reader friendly.  
- Code quality: Clean, modular, and well-documented.
 
### Submission Mode

Deploy your project (Vercel or Netlify recommended).Submit:  

- Live deployed app link
- GitHub repo with code + setup instructions
- Example confirmation email template (HTML)

### Study Material  

- React Official Docs: [https://react.dev/](https://react.dev/)
- Next.js Docs: [https://nextjs.org/docs](https://nextjs.org/docs)
- Convex Backend Docs: [https://docs.convex.dev/](https://docs.convex.dev/)
- Forms & Validation in React: [https://react.dev/learn/forms](https://react.dev/learn/forms)
- Responsive Layouts: [https://css-tricks.com/snippets/css/media-queries-for-standard-devices/](https://css-tricks.com/snippets/css/media-queries-for-standard-devices/)
- Sending Emails:
	- Resend API: [https://resend.com/](https://resend.com/)  
	- Nodemailer: [https://nodemailer.com/about/](https://nodemailer.com/about/)