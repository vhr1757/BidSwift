import "./SearchFilter.css";

function SearchFilter({
  search,
  category,
  categories,
  onSearchChange,
  onCategoryChange,
  onClear,
  searchPlaceholder = "Search by item name...",
}) {
  return (
    <div className="search-filter">
      <div className="search-filter-field">
        <label htmlFor="search-filter-input">Search Items</label>

        <input
          id="search-filter-input"
          type="text"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="search-filter-field">
        <label htmlFor="search-filter-category">Category</label>

        <select
          id="search-filter-category"
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

      <button type="button" className="search-filter-clear" onClick={onClear}>
        Clear
      </button>
    </div>
  );
}

export default SearchFilter;
