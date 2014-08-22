# mechanize

The Mechanize module is used for automating interaction with websites.
Mechanize automatically stores and sends cookies, follows redirects,
can follow links, and submit forms. Form fields can be populated and
submitted. Mechanize also keeps track of the sites that you have
visited as a history.

## Getting Started

From the root folder, you can run the *get_page* example:

`node bin/get_page.js`

To load from a specific URL:

`node bin/get_page.js "http://www.cnn.com"`

The example gets the page and then performs a `console.log()` on all of the returned object data.

For form posting, you can run the *submit_form* example:

`node bin/submit_form.js "http://localhost/"`

The example POSTs a username and password to the */login* path at the specificied URL

## Installation

From the mechanize directory, run npm install:

`npm install`

## Dependencies

    cookiejar >= 1.3.0
    libxmljs >= 0.8.1
    request >= 2.21.1
    mime >= 1.2.9

## Credits

This borrows heavily from Aaron Patterson's
[mechanize](http://mechanize.rubyforge.org/) Ruby gem.