# svg-flag-editor

Online tool for editing flag SVG image source

## What is it for?

This tool helps editing SVG source files (in `xml` or `pug` format), with the focus on minimal file size (currently it just rounds path coordinates to make paths shorter).

## But... why?

Why what?

## Why do you need this?

Well, recently I needed phone picker control (you know, international, with flags and stuff) and found out these controls are usually using single PNG image with sprites. Which is not cool, I thought. So I want to make it with SVG flags, but existing svg flag collections (I mean this awesome [flag-icon-css](https://github.com/lipis/flag-icon-css)) is too big for little cute control. That's why I want to try to make it as small as possible.

## How small, exactly?

Let's say, `< 500` bytes each. So, like, less than 100k in total.
Obviously, that means flags cannot be very detailed, but that's ok, as they are supposed to be used as small thumbnails.

## Hm, that sounds stupid, but I want to help anyway

Great! You can draw your favorite (or least favorite, whatever) flag in any vector editor (flag size is 120x90), save it in SVG and paste the source in this tool. Then, clean it up and make a PR in [micro-flag-icons](https://github.com/alexkuz/micro-flag-icons) repo.

## But why do you use `pug` here?

I dunno. I like it. It's just much better than XML.
