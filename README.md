## Sticker manager

This is a C# .NET 8 webapi project with an Angular frontend to manage stickers. The database used is MariaDb and, thanks to the minor image weight, they are saved into the database as blobs.

First stage reached is just sticker and tag management, and a dashboard with some cool charts around the database elements.

#### Tag section

The tag area consists of two views, one for create and edit tags (just the tag name), and other to query the data in a tabular way. This table allows to edit or delete every row by clicking the icons in the action column of the table.

#### Category section

The category area consists of two views, as in tags, one for create and edit, and other to query the data in a tabular way. This table also allows to edit or delete the row icons. This area is intended as a superclass of tags, to avoid repeating tags. Also, a sticker can be in multiple categories, as in tags. 

#### Sticker section

The sticker area also has the create and edit view. In itm you can edit the name and the sticker tags and the image of the sticker. As stated, it is saved as a blob in the database, in two sizes. The dropdowns allow to search and create new tags or categories on the fly.

There are two ways to view the stickers: as a gallery, or as tabular data. In the table, you need to click in a detail button for the image to be shown. In the gallery view, thumbnails of the stickers are shown for a more visual browsing of the stickers.

#### Pagination

The results are paginated, with a dropdown to choose how many elements will be shown. Pagination differs depending on the view: in tabular data, the pagination happens at client side. On the other side, the gallery is paginated on server, querying just the results you are about to see, as base64 images are requested.

#### Filtering

The sticker views share a common component with the buttons and fields to request the data. It allows to find by name and tag, and order the results by date (not shown) and name, ascending or descending. This form also has a button to reset the form. It just clears the form, not triggering a new search.

---