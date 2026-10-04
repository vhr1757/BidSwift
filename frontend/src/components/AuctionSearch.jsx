import "./AuctionSearch.css";

function AuctionSearch({
  search,
  category,
  categories,
  onSearchChange,
  onCategoryChange,
  onClear,
}) {
  return (
    <div className="auction-search">
      <div className="auction-search-field">
        <label htmlFor="auction-search">Search Auctions</label>

        <input
          id="auction-search"
          type="text"
          placeholder="Search by item name..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="auction-search-field">
        <label htmlFor="auction-category">Category</label>

        <select
          id="auction-category"
          value={category}
          onChange={(event) => onCategoryChange(event.target.value)}
        >
          <option value="">All Categories</option>

          {categories.map((categoryOption) => (
            <option key={categoryOption} value={categoryOption}>
              {categoryOption}
            </option>
          ))}
        </select>
      </div>

      <button type="button" className="auction-search-clear" onClick={onClear}>
        Clear
      </button>
    </div>
  );
}

export default AuctionSearch;
