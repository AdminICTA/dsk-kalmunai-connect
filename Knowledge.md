Admin dashboard 
--------------------------------------------
1.Department creation (Dep_id, name)
2.Division creation (Div_ID, Dep_id, Name)
3.user creation - Admin and Reception_Staff account (User_Id, Name, Post, Department, Divisions, Role(Admin/ Reception_Staff), username and password)
4. Subject staff creation - (Sub_Id, Name, Post, Department, Divisions,, username and password)
* create subject staff account with assigned divisions only and after the login, they can be view or edit their assigned divisions Documents only.
* Upload Documents with division wise
* One divisions has many documents 
* Documents has to vary (Personal,office and common)        

5.Can view overall app 
6. Account setting 
7. real Updated Stats

Reception Dashboard
----------------------------------
Now, develop the Reception Dashboard and update the corresponding SQL file to include the creation of all necessary tables for this dashboard.
Reception Dashboard
After successful login as Reception_Staff, redirect to the Reception Dashboard. Maintain the same interface design like admin 

1. Public management part 
- New Public account creation and generate Id card with scannable QR code (Pubic_ID, Name, NIC, Address, Mobile number date of birth).
-generate the ID card like in the uploaded image (The ID card format must be like in the picture, dont change any part. the logos are uploads as svg image). "modify the black and white government identification card for printing, sized for a wallet. The header should contain two official logos(the uploaded images)—one on the left and one on the right—aligned at the top corners. Centered between the logos is the heading “Divisional Secretariat - Kalmunai” in bold, clear lettering. The left side of the card should include labeled fields for Name, NIC, Date of Birth, Mobile Number, Address  and Public_ID. The right half of the card should be dominated by a large QR code occupying roughly 50% of the card width. Use a clean, minimal layout with sharp contrast suitable for monochrome printing, and formal typography for a professional appearance."

2. After Public account creation , it will automatically redirect to Public registry management. 
3. In the public registry management, the all details of public account have to fill automatically with added the new fields like 'purpose', 'department' and division. fill the purpose of visit and select division from department and generate token if I click the generate token button.
4. If the existing public visit - go to the Public register management, click scan ID card , through scanning, update the basic information from database and fill other details and generate the token. 
5. View History = Scan ID card for view the past history of the particular existing public account through the id card QR scanning.
6. Token view management = this part needs to show in TV with  under the each Department, all division's current token number needs to appear with order wise.
7. After the staff completes the process for each individual, they mark the token to indicate that the services are complete and signal the next person in line within that division. Each time a person’s task is completed, the next token can be updated accordingly.
8. Notification -
- can send notification for the Public as a single or group
- View the notification of the public and make  the services to accept or pending, reject or completed 
9. Account setting 

Subject Staff Dashboard Promo:
---------------------------------------------------------
"Subject Staff Dashboard: Efficient Document Management
Backend API:
create endpoint that handles all CRUD operations for departments (create, read, update, delete)
Add a proper error handling and validation
Implement soft deletes by setting status to 'inactive' instead of hard deletes
Frontend Updates:
Update the all of Management components in each dashboard with database connection to make API calls to the backend

Our subject staff dashboard enables efficient management of division-wise documents, online editing, and downloads. Key features include:

- Document Management: View, edit, and download documents specific to assigned divisions
- Online Editing: Edit Excel documents online and save changes
- Document Downloads: Download Word documents for assigned divisions
- Common Documents: Access common documents across divisions
- Personal Documents: Manage personal documents for individual staff accounts
- Account Settings: Customize subject staff account settings for enhanced security

Let us build a subject staff dashboard that streamlines document management and enhances productivity!"

Public Dashboard Promo:
------------------------------------------------------
"Public Dashboard: Seamless Service Access
Backend API:
create endpoint that handles all CRUD operations for departments (create, read, update, delete)
Add a proper error handling and validation
Implement soft deletes by setting status to 'inactive' instead of hard deletes
Frontend Updates:
Update the all of Management components in each dashboard with database connection to make API calls to the backend

Our public dashboard provides a user-friendly interface for accessing services, generating digital tokens, and viewing past visit history. Key features include:

- Digital ID Card: View and access digital ID cards
- Service Access: Access services and generate digital tokens
- Token Generation: Generate tokens for visits and view current token numbers
- Past Visit History: View past visit history and access relevant documents
- Notification System: Send notifications to staff and receive status updates
- Account Settings: Customize public account settings for enhanced security

update the image to the particular ID card design and the format. now you have to create the php files for the backend. the backend should be end to end connection with my cPanel database
with proper api. i can upload the backend and frontend files in my cPanel public_html folder to run this web app. the authentications are properly connect with front end and sign-out also
Subject dashboard 

1. Can view all the divisions documents 
2. Edit the excel documents in online and save it or download it.
3. Download the word documents.
4. Common documents
5. Personal documents 
6. Account setting 

Public dashboard 
---------------------------------------------------------------------------
1. Can view their digital ID card in their account setting 
2. View the services and download the relevant documents and can generate the digital token
3. the digital token must be show the current update number. 
4. View past history of their visit - only viewable can't edit
5. Send notification to the staff dashboard.
6. View notification- can be view updates of their current status (accept, reject, pending and completed) of request or application or appointment.