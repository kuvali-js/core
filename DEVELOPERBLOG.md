ConnectivityService: write jest tests

> [!NOTE] working
> The app and core are working


## SupabaseService 
- [ ] start implementing SupabaseService
- [ ] start implementing IdentityService
- [ ] start implementing AuthService
- [ ] start implementing LoginService

---
<sup><sub>end header</sup></sub>
 
---
<sup><sub> git push - 22.01.2026 16:21 </sub></sup><br/>
## SupabaseService 

- [ ] Focus: create SupabaseService und jest tests

<sup><sub> 16:15... </sub></sup>

## SupabaseService 

- [ ] start implementing SupabaseService
- [ ] start implementing IdentityService
- [ ] start implementing AuthService
- [ ] start implementing LoginService

<!-- RANT-START --
Fuck! I wsted the whole day for making clear, what the priciples should be for the dvelopment of Kuvali. Just because, I wanted to create "just iwithin a view minutes" a prompt to tell AI how to implement the future services and core features. Right now the IdentityService and AuthServices. Shit.

Interestingly, at each prompt, AI asked me to implement these services ;-) And I copied the code in the files already. Not all is lost. 

> This it not how to fast implement an MVP!
> 
<!-- RANT-END -->
 
<sup><sub> ...16:00...16:20...break... </sub></sup>

# Option to ignore files for push


Added patterns to .gitignore "\_*", "\#*", "\~*" to ignore files in git push operations.
Now I can have files that are ignored by the tracking and left out of the public github repository. 
Also to deveop a feature and have different files until I decide which one will be the final one.

<sup><sub> ...15:00...16:00... </sub></sup>

### Change README 

- [x] Change README.md 
  with comprehensive explanation of the Kuvali procejt, based on Kuvali Principles document.

<sup><sub> 22.01.2026 10:30...12:30...15:00 </sub></sup>

### Service Implementation Principles definition

Basic discussion how to implement this:
- class vs object
- event-driven
- using ConnectivityService 

Did waste another 2.5 hours - no: 5! hours - in creating a document with the [Kuvali Principles](./Kuvali-Priciples.md). 

Ok, got IdentityServices and AuthServices on the way. Only the examples from AI (Gemini, Copilot).

**Rant:** I am here since 5 hours? What did I do? 

---
<sup><sub> git push - 22.01.2026 04:30 </sub></sup><br/>
<sup><sub> 22.01.2026 03:00...04:30 </sub></sup>

### jj automation

Don't know if the starting time is correct.
Did create two functions in fish shell to automate jj.
- First one opens this file to add informations. And shows jj log and status.
- Second one to wrap up and commit changes to the cloud:
  - it cuts everything from "end header" to the first "git push"
  - sets it as description for jj
  - sets the bookmark
  - pushes to GitHub
  - creates new, empty slate for the next feature.

Used when a day ends or a feature is done and will be commited.
I just call jj1, add my comments to this file, call jj2 and have a new sheet.
And can be sure everything is secure in the cloud.

<sup><sub> ...21.01.2026 16:30...break...16:45...22.01.2026 03:00...04:30 - 16:15 hours </sub></sup>

## ConnectivityService 

- [x] Focus: create jest tests for ConnectivityService & fix some bugfixes
- [x] check hook for status change online  -> offline
- [x] check hook for status change offline -> online
- [x] some more basic High Level tests.
- [x] added Unsubscribe Pattern to ConnectivityService event functions.

All tests are green and uncovered even some (minor) bugs in the code.
Mostly writing the mocks and events were the problem today. :-(

> Application and tests are working.
  
Was a successful day. still worked on ConnectivityService and not on Supaebase/Auth/Log.


---
<sup><sub> 21.01.26 12:15... </sub></sup>

## ConnectivityService

**💩 Aufgeschoben: 4 hours**

Wanted to update the badges in the README file to show a nice status.
When I wanted to show the version numbers of the used packages, it did not show tham and showed the error "someting is wrong" over and over again. Only after quite some time, I discovered that the repository is set to "private". After changing it to public the badges worked.

- [x] Wasted quite some time to make them show up "nice".
- [x] Wasted quite some time to have links to GitHub and links to NPM with the used version number, read from the package.json of the project.

> [!NOTE] Private repository
>
> A big issue in the last hours was that the @kuvali-js/core repository was private.
> Changed it to public and it worked.
 
---

<sup><sub>git push - 21.01.2026 00:35</sub></sup><br/>
<sup><sub>20.01.26 09:27...00:35 - 15:40 hours </sub></sup>

## ConnectivityService
