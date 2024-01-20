defmodule TopModule do
  def first_top_function(a, b) when is_atom(a) do
    IO.puts("a: #{inspect(a)}")
  end

  defmodule InnerModule do
    def first_inner_function(arg) do
      IO.puts("arg: #{inspect(arg)}")

      # Example: cursor right of word with empty selection
      new_function
      # ---------^

      # Example: cursor in word with empty selection
      new_function
      # ----^

      # Example: cursor right of word with word selected
      new_function
      #---------]^

      # Example: simple signature with cursor after closing parenthesis and empty selection
      new_function(arg, other_arg)
      # --------------------------^

      # Example: simple signature selected with cursor after closing parenthesis
      new_function(arg, other_arg)
      # -------------------------]^

      # Example: simple signature with function name selected and cursor before opening parenthesis
      new_function(arg, other_arg)
      # ---------]^

      # Example: cursor right of word inside a function call
      first_inner_function(new_function())
      # -------------------------------^

      # Example: cursor inside word inside a function call
      first_inner_function(new_function())
      # -------------------------^
    end

    def second_inner_function(arg) do
      IO.puts("arg: #{inspect(arg)}")
    end

    def last_inner_function(arg) do
      IO.puts("arg: #{inspect(arg)}")
    end
  end

  def last_top_function(arg) do
    IO.puts("arg: #{inspect(arg)}")
  end
end
