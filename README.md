# Logistics  

**Q1:** At what time in the week would your group be available to meet online?  
**Example:**  
*We are available to meet online on weekends from 12pm-8pm (12-2pm Saturday + Sunday), as well as from 4pm-6pm on Fridays.*  
*Our weekly meeting will be Thursday 11am-12pm.*  

**Answer**

We are available to meet 5 - 7 PM from Monday to Friday. We will meet weekly on Tuesdays at 5 PM.

---

# Timeline: Weekly Meeting Goals  

**Q2:** What is your goals that your group want to achieve in each weekly meeting?  
**Example:**  
*Prior to 3/13: Weekly Meeting we will plan out some preliminary info/idea for the project itself ahead of the scheduled meeting like which data source/API and data structures we will use in our backend. We will browse [the given list of public APIs for inspiration](https://github.com/public-apis/public-apis).*  

*During week of 3/25: Work on the project rough draft itself to make a functioning project with data input, data structure usage, and processing into output on the frontend.*  

*Prior to 4/17: Meet together weekly to target project weakpoints/bugs and possibly visit office hours to get guidance if the progress feels weak.* 

**Answer**

Prior to 10/23

    - Weekly meetings to plan project approach and outline

    - Create first prototype using Figma

    - Begin agile sprint cycles leading toward a working prototype


Prior to 11/20

    - Start agile sprints the week after 10/23

    - Incorporate peer review feedback from Milestone 3

    - Continue iterative development and refinement of working prototype


Prior to 12/05

    - Have presentation roles established, and drafted presentation

    - Finalize project for presentation

    - Ensure all code is reviewed, revised, and ready for submission


---

# Communication  

**Q3a:** How can your group communicate when doing the Full Stack Group Project?  
**Q3b:** What are the usernames of each group member on that platform?  
**Q3c:** What is your group’s expected response time to messages?  

**Answer**

*We will use Discord for communication*  

*Usernames:*  
*Edgar - egadabeast*  
*Rogelio - tyson_bruh*  
*Fernando - fjronero99*  
*Alex- gwheeze77*  
*Our expected response time will be within 12 hours.*  

---

# Norms  

**Q4a:** How will your group handle situations when there is conflict in your group?  
**Q4b:** How will your group handle situations when a member is not contributing enough?  

**Answer**

*We will all propose our viewpoints and their respective pros and cons. The group will then come to a consensus on what approach we all agree would be the best*  

*We will hold a meeting to address the shortcomings of the group member and address how we could best support them so that they could be assigned tasks that would allow them to contribute equally in comparison to the rest of the group.*  

---

# Roles  

**Q5:** How will your group divide your role in the Group Project?  

**Example:**  
*Mauricio - Backend, Justin - Project Lead, Claudia - Frontend.*  

---

# Tech Stacks

**Q6:** Which tech stacks will your group use? (Django + React or Flask + React)

---
# Full Stack Group Project Track  
---

# Track 1: Tackling Generative AI Consequences
**Problem 1:** 

**Solution 1:** 

---

# Track 2: Technology for Public Goods 

**Problem 2:**

**Solution 2:** 

**Problem 3:** 

**Solution 3:**  

# Track 3: Creative Coding and Cultural Expression

**Idea - Story - Inspiration 4:**

**Implementation 4:**

**Idea - Story - Inspiration 5:**

**Implementation 5:**


# Idea Finalization

**From 5 project ideas you have above, please choose one of the project that you are going with for the rest of the semester. Explain why you are going with that project**

# Extra Credit (Only do this if you are done with Idea Finalization)

## Database Design

**Q1: What database are you using for your project (SQLite, PostgreSQL, noSQL, MongoDB,...), and why do you choose it?**

**Answer**

* Mongo for non structured data like digital media (images,videos, documents), and then a relational database like sqlite or postgres to store user data (CRUD app features) with online forum. Sqlite3 offers very easy integration with simple library like sqlite3 in python.

**Q2: How will database be helpful to your project? How will you design your database to support your application features?**

**Answer**

* database is essential to project. It stores all user data and allows for updating of the website. Design the database with a MVP/ simple schema and then increase complexity if needed.

## Third-Party API Integration

**Q3: Which third-party API(s) will you integrate into your project? What data will you pull from the API(s), and how will you use it in your application?**

**Q4: Does your API key has limitations such as rate limits or downtime? How are you going to deal with that?**

**Answer**

## Authentication and Security

**Q5: What authentication method will you use (e.g., username/password, OAuth, JWT)?**\

**Answer**

**Q6: How will you store and protect sensitive user data (e.g., passwords, tokens)?**

**Answer**

* Encrypt personal information and passwords using built- in libraries. For tokens, we will pick strong keys and have them expire quickly to mitigate security vulnerabilities. Finally, the simplest, but most likely the most effective thing that we can do is limit others from accessing information they shouldn't be able to. Similar to the industry standard, we will use strict privilege permissions to the DB.

## Deployment

**Q7: Where will you deploy your project (e.g., Heroku, AWS, Render)? How will you manage environment variables and secrets during deployment?**

**Answer**

* Heroku seems like a nice option for a straightforward deployment. However, we can also always run in a docker container if needed. To manage environmental variables, we will avoid committing sensitive data in code to github as we already have done in part 1 (.env). 

**Q8: How will you ensure your deployment is reliable and easy to update?**

**Answer**

* We will ensure development is reliable and easy to update by using version control throughout the entire development process. As for deployment, we plan to thoroughly test or program as well as implement logging and monitoring of program during runtime. Finally, if needed, we can always containerize our application so that it can run cross platform with fewer dependency issues.
